"""Streamlined Gita RAG Pipeline.
Strictly uses LLM intelligence for Ask Gita, while maintaining crisis safety.
"""
import json
import logging
import re
import math
import unicodedata

from typing import Literal, Optional
from pydantic import BaseModel, Field
from collections import Counter

logger = logging.getLogger("gita.rag")

CRISIS = re.compile(
    r"\b(suicid(?:e|al)|kill(?:ing)? myself|end my (?:life|existence)|take my (?:own )?life|"
    r"want to die|wish (?:i was|i were) dead|better off dead|self[- ]?(?:harm|injury)|hurt(?:ing)? myself|"
    r"harm(?:ing)? myself|cut(?:ting)? myself|(?:end|ending) it all|don't want to (?:live|be alive)|"
    r"do not want to (?:live|be alive)|can't go on|cannot go on|no reason to live|"
    r"overdose|not safe with myself|don't want to be here anymore)\b", re.I
)

CRISIS_TE = re.compile(
    "ఆత్మహత్య|"
    "చ(?:ని|చ్చి) ?పో(?:వాలి|వాలని|వాలనుకు|వాలనిపి|తాను|దాం)|"
    "చావాలని|చావాలనిపి|చావాలనుకు|"
    "(?:నన్ను నేను|నాకు నేను) ?(?:చంపుకు|చంపుకో|హాని|గాయ|కోసుకు|కోసుకో|బాధ ?పెట్టుకు|బాధ ?పెట్టుకో)|"
    "(?:చేతులు|చేతిని|చేయి|మణికట్టు) ?కోసుకు|(?:చేతులు|చేతిని|చేయి|మణికట్టు) ?కోసుకో|ప్రాణ(?:ం|ా(?:లు|న్ని)) ?తీసుకు|ప్రాణ(?:ం|ా(?:లు|న్ని)) ?తీసుకో|"
    "బ(?:్ర)?తకాలని(?: ?అనిపించడం)? లేదు|"
    "బ(?:్ర)?తకడం ఇష్టం లేదు|"
    "బ(?:్ర)?తకలేను|"
    "జీవించాలని లేదు|"
    "జీవిత(?:ాన్ని|ం) ?(?:ముగించ|అంతం)|"
    "ఉరి ?వేసుకు|ఉరి ?వేసుకో|ఉరేసుకు|ఉరేసుకో|"
    "విషం తాగ|"
    "పురుగుల మందు తాగ|"
    "నేను లేక(?:పోతే|ుంటే) ?(?:బాగుండు|బాగుంటుంది)"
)
CRISIS_TE_LATIN = re.compile(
    r"\b(?:aa?tmahatya|chanipoval(?:i|ani)|chachipoval(?:i|ani)|chanipotanu|chachipotanu|"
    r"(?:ba|bra)thakalani ledu|(?:ba|bra)thakaledu|(?:ba|bra)thakalenu)\b", re.I
)
TELUGU_SCRIPT = re.compile(r"[\u0C00-\u0C7F]")

CITATION = re.compile(r"\[BG\s*(\d{1,2}\.\d{1,2})\]", re.I)

class ChatResponseSchema(BaseModel):
    intent: Literal["conversational", "factual", "verse_lookup", "guidance"] = Field(
        description="Type of user request."
    )
    content: str = Field(
        description="The formatted response in clean Markdown. "
                    "Use blockquotes ('> ') for verse quotes and '### A small practice' only when giving guidance."
    )
    cited_verse_ids: list[str] = Field(
        default_factory=list,
        description="List of verse IDs (e.g., ['10.8']) specifically quoted or explained in the response. Empty if none."
    )

INTENTS = {"conversational", "factual", "verse_lookup", "guidance"}

def _parse_llm(data: dict, default_intent: str = "conversational") -> ChatResponseSchema:
    content = data.get("content")
    if isinstance(content, list):
        content = "\n\n".join(str(c) for c in content)
    content = str(content or "").strip()
    if not content:
        raise RuntimeError("The AI returned an empty answer. Please try again.")
    intent = str(data.get("intent", "")).strip().lower().replace(" ", "_").replace("-", "_")
    if intent not in INTENTS:
        intent = default_intent
    raw = data.get("cited_verse_ids") or []
    if not isinstance(raw, list):
        raw = [raw]
    ids = [str(x).replace("BG", "").strip() for x in raw if x is not None]
    return ChatResponseSchema(intent=intent, content=content, cited_verse_ids=ids)

def _normalize(text: str) -> str:
    text = unicodedata.normalize("NFKC", str(text))
    text = text.replace("\u2018", "'").replace("\u2019", "'")
    text = re.sub("[\u200b\u200c\u200d\ufeff]", "", text)
    return re.sub(r"\s+", " ", text)


def has_telugu(text: str) -> bool:
    return bool(TELUGU_SCRIPT.search(text))


def crisis_detected(text: str) -> bool:
    text = _normalize(text)
    return bool(CRISIS.search(text) or CRISIS_TE.search(text) or CRISIS_TE_LATIN.search(text))

STOP = set("the and for you your with that this are was were have has had not but from they them what when how why who which can will would should could about into than then there their its our out all any".split())

def _tokens(text: str) -> list[str]:
    return [w for w in re.findall(r"[a-z]+", _normalize(text).lower()) if len(w) > 2 and w not in STOP]

def _flat(x) -> str:
    return " ".join(map(str, x)) if isinstance(x, (list, tuple)) else str(x or "")

VERSE_REFS = (
    re.compile(r"\b(?:BG|gita|geeta)\s*(\d{1,2})\s*[.:]\s*(\d{1,3})\b", re.I),
    re.compile(
        r"(?:chapter|adhyay\w*|అధ్యాయ\w*)\D{0,12}?(\d{1,2})\D{0,25}?"
        r"(?:verse|slok\w*|shlok\w*|శ్లోక\w*)\D{0,6}?(\d{1,3})", re.I),
)

BARE_REF = re.compile(
    r"(?<![\d.:/$£€₹])(\d{1,2})\.(\d{1,3})(?![\d.:/%])"
    r"(?!\s*(?:am|pm|a\.m|p\.m|hrs?|hours?|mins?|minutes?|kg|km|rs|rupees|dollars|lakhs?|crores?)\b)", re.I)

VERSE_WORD = re.compile(r"\b(?:verse|verses|slok\w*|shlok\w*|gita|geeta|bg|chapter)\b|శ్లోక|గీత|అధ్యాయ", re.I)

QUOTE_SLOT = re.compile(
    r"^[ \t]*(?:>[ \t]*[^\n\[]{0,80}?)?\*{0,2}\[BG\s*(\d{1,2}\.\d{1,3})\]\*{0,2}[.:;,]?[ \t]*\r?$", re.M)

PROMPT_INTRO = (
    "You are Gita AI, a warm and grounded companion for exploring the Bhagavad Gita and applying it "
    "to everyday life. Talk like a thoughtful friend who knows the Gita deeply: natural, specific, "
    "calm, never preachy or robotic.\n\n"
)

PROMPT_RULES = (
    "UNDERSTANDING THE USER\n"
    "- The user may write in English, Telugu script, Telugu typed in English letters (Tenglish), or "
    "Hindi/Hinglish. Understand all of them. Useful Tenglish: chupinchu/chupinchi = show, "
    "cheppu/cheppandi = tell, ardham/meaning = meaning, vivarana/explain chey = explain, sloka = verse, "
    "inka = more, malli = again, tarvata = next.\n"
    "- Read the whole conversation before answering. Resolve words like \"it\", \"that verse\", "
    "\"its meaning\", \"explain more\", \"again\", \"next one\", \"simpler\", \"give an example\" from the "
    "earlier turns and from the REFERENCE VERSES block. A short follow-up is NEVER just a greeting: if the "
    "last turn was about a verse, a message like \"meaning explain chey\" means \"explain the meaning of "
    "that verse\".\n"
    "- If the user asks for something already given, build on it (more depth, simpler words, an example, "
    "word-by-word meanings) instead of repeating it.\n"
    "- If a request is truly ambiguous, ask ONE short clarifying question. Never answer a clear follow-up "
    "with a generic \"what would you like to know?\".\n\n"
    "HOW TO ANSWER\n"
    "- Match length to the message: casual chat 1-2 sentences; factual question 1-2 short paragraphs; "
    "verse explanation as long as it needs; guidance focused and warm.\n"
    "- Greet only if the user greets you or this is the very first message. Never open later replies with "
    "\"Namaste\" or a recap of the question.\n"
    "- Do not end every reply with a question. Ask a reflective question only in guidance replies, and "
    "only when it helps.\n"
    "- Offer a practice only when the user is asking for guidance about their own life.\n"
    "- If a question is unrelated to the Gita, philosophy or personal reflection, answer in one or two "
    "friendly sentences if you can and gently say your focus is the Gita.\n"
    "- Never diagnose, and never give medical, legal or financial advice. When commentators differ on a "
    "verse, say so instead of claiming certainty.\n\n"
    "VERSES\n"
    "- REFERENCE VERSES (when present) are authoritative corpus data. Base your explanation on them and "
    "never contradict them.\n"
    "- NEVER write Sanskrit yourself, in Devanagari, Telugu or any other script; it is error-prone. To show "
    "a verse, write a line containing only:  > [BG X.Y]  The server replaces that line with the exact "
    "Sanskrit, transliteration and translation.\n"
    "- For word-by-word meanings, split the transliteration from the reference block and write each "
    "Sanskrit word in Latin transliteration exactly as given, followed by its meaning in the reply language.\n"
    "- Cite a verse only when you are sure of its number; otherwise describe the teaching without a "
    "citation. Add every cited verse number to cited_verse_ids.\n"
    "- If asked for the next or previous verse, use the ADJACENT VERSES block.\n"
    "- Do not reuse the same verse in consecutive guidance replies unless the user asks for it.\n\n"
    "FORMAT (Markdown)\n"
    "- Short paragraphs. Use **bold** sparingly for key terms. Use \"- \" bullets for word meanings or "
    "steps. Use \"### A small practice\" only in guidance replies. No tables, no HTML, and no emojis unless "
    "the user uses them.\n\n"
    "REPLY TYPES (set \"intent\")\n"
    "- conversational: greetings, thanks, small talk, reactions. Brief and natural, no verse.\n"
    "- factual: questions about the Gita itself (structure, characters, terms, context). Direct and "
    "accurate, no verse unless it is the best evidence.\n"
    "- verse_lookup: the user wants a specific verse, its meaning, word-by-word meaning, or a follow-up "
    "about a verse. Show it with the slot line, then explain.\n"
    "- guidance: the user shares a feeling or life situation. Acknowledge the feeling first, then give one "
    "fitting verse (slot line), how it applies in plain words, and, only when helpful, \"### A small "
    "practice\" with one concrete step.\n\n"
    "OUTPUT\n"
    "Return ONLY a JSON object, no code fences: "
    "{\"intent\": \"conversational|factual|verse_lookup|guidance\", "
    "\"content\": \"<Markdown reply>\", \"cited_verse_ids\": [\"3.5\"]}\n\n"
)

SAFETY_NOTE = (
    "SAFETY CONTEXT: Earlier in this conversation the user expressed thoughts of self-harm or not wanting "
    "to live. Stay warm and steady. Do not repeat a crisis script or list helplines unless they raise it "
    "again or seem to be in danger now. Respond to what they are actually saying, gently check in on how "
    "they are feeling, and keep any verse or practice very light or skip it. If they signal danger, "
    "encourage them to contact local emergency services or a trusted person.\n\n"
)


class RagPipeline:
    def __init__(self, verses: list[dict], providers):
        self.verses = verses
        self.by_id = {v["id"]: v for v in verses}
        self.order = [v["id"] for v in verses]
        self.pos = {vid: i for i, vid in enumerate(self.order)}
        self.providers = providers
        self.doc_tf, df = {}, Counter()
        for v in verses:
            toks = _tokens(" ".join(_flat(v.get(k)) for k in ("english", "meanings", "themes")) + " " + _flat(v.get("themes")))
            self.doc_tf[v["id"]] = (Counter(toks), len(toks))
            df.update(set(toks))
        n = len(verses)
        self.idf = {t: math.log(1 + (n - c + 0.5) / (c + 0.5)) for t, c in df.items()}
        self.avg_len = sum(l for _, l in self.doc_tf.values()) / max(n, 1)

    def _find_ids(self, text: str, allow_bare: bool = False) -> list[str]:
        found: list[str] = []
        text = _normalize(text)
        patterns = list(VERSE_REFS)
        if allow_bare and (VERSE_WORD.search(text) or re.fullmatch(r"\s*\d{1,2}\.\d{1,3}\s*[?.!]*", text)):
            patterns.append(BARE_REF)
        for pattern in patterns:
            for chapter, verse in pattern.findall(text):
                vid = f"{int(chapter)}.{int(verse)}"
                if vid in self.by_id and vid not in found:
                    found.append(vid)
        return found

    def _search(self, query: str, k: int = 3) -> list[str]:
        q = set(_tokens(query))
        if len(q) < 2:
            return []
        scored = []
        for vid, (tf, length) in self.doc_tf.items():
            hits = [t for t in q if t in tf]
            if len(hits) < 2:
                continue
            s = sum(self.idf[t] * tf[t] * 2.5 / (tf[t] + 1.5 * (0.25 + 0.75 * length / self.avg_len)) for t in hits)
            scored.append((s, vid))
        scored.sort(reverse=True)
        return [vid for score, vid in scored[:k] if score >= 2.0]

    def _focus_ids(self, query: str, history: list[dict]) -> list[str]:
        ids = self._find_ids(query, allow_bare=True)
        if ids:
            return ids[:2]
        for message in reversed(history):
            ids = self._find_ids(message["content"])   # strict: no bare decimals from history
            if ids:
                return ids[:2]
        return []

    def _reference_block(self, focus: list[str], candidates: list[str] = ()) -> str:
        if not focus and not candidates:
            return ""
            
        def render(ids: list[str]) -> str:
            blocks = []
            for vid in ids:
                v = self.by_id[vid]
                lines = [f"[BG {vid}]"]
                for label, key in (("Transliteration", "transliteration"),
                                   ("English translation", "english"),
                                   ("Word meanings", "meanings")):
                    value = str(v.get(key) or "").strip()
                    if value:
                        lines.append(f"{label}: {value}")
                blocks.append("\n".join(lines))
            return "\n\n".join(blocks)

        block = ""
        if focus:
            adjacent: list[str] = []
            for vid in focus:
                i = self.pos[vid]
                for j in (i + 1, i - 1):
                    if 0 <= j < len(self.order):
                        other = self.order[j]
                        if other not in focus and other not in adjacent:
                            adjacent.append(other)
                            
            block += ("REFERENCE VERSES (authoritative corpus data; base your answer on this, not on memory):\n"
                      + render(focus) + "\n\n")
            if adjacent:
                block += ("ADJACENT VERSES (use only if the user asks for the next or previous verse):\n"
                          + render(adjacent) + "\n\n")
        
        if candidates:
            block += ("POSSIBLY RELEVANT VERSES (keyword-search suggestions, may be off-topic; use one only if it "
                      "truly fits the user's message, otherwise ignore):\n" + render(candidates) + "\n\n")
                      
        return block

    def _expand_quotes(self, content: str, language: str) -> str:
        """Replace '> [BG X.Y]' slot lines with exact corpus text."""
        def replace(match: re.Match) -> str:
            vid = match.group(1)
            v = self.by_id.get(vid)
            if not v:
                return ""
            if language == "te":
                sanskrit = str(v.get("sanskrit_te") or v.get("sanskrit") or "").strip()
                meaning = str(v.get("telugu") or v.get("english") or "").strip()
                if v.get("telugu_range") and v.get("telugu"):
                    meaning += f"\n(ఈ అనువాదం {str(v['telugu_range']).replace('-', '–')} శ్లోకాలకు కలిపి ఇవ్వబడింది.)"
            else:
                    sanskrit = str(v.get("sanskrit") or "").strip()
                    meaning = str(v.get("english") or "").strip()
            translit = " ".join(str(v.get("transliteration") or "").split())
            blocks = []
            if sanskrit:
                blocks.append(sanskrit)
            if translit:
                blocks.append(f"*{translit}*")
            if meaning:
                blocks.append(meaning)
            if not blocks:
                return match.group(0)
            blocks[-1] += f" [BG {vid}]"
            return "\n>\n".join("> " + b.replace("\n", "\n> ") for b in blocks)

        return QUOTE_SLOT.sub(replace, content)

    def care_first(self, country: str = "global", language: str = "en") -> dict:
        if language == "te":
            support = {
                "IN": "భారతదేశంలో టెలి-మానస్ (Tele-MANAS) 14416 కు కాల్ చేయండి. తక్షణ అత్యవసర పరిస్థితిలో 112 కు కాల్ చేయండి.",
                "US": "అమెరికాలో 988 కు కాల్ లేదా టెక్స్ట్ చేయండి. తక్షణ ప్రమాదంలో 911 కు కాల్ చేయండి.",
                "CA": "కెనడాలో 988 కు కాల్ లేదా టెక్స్ట్ చేయండి. తక్షణ ప్రమాదంలో 911 కు కాల్ చేయండి.",
            }.get(country, "భారతదేశంలో టెలి-మానస్ (Tele-MANAS) 14416 కు కాల్ చేయండి; అత్యవసరమైతే 112. "
                           "అమెరికా లేదా కెనడాలో 988 కు కాల్ లేదా టెక్స్ట్ చేయండి. "
                           "ఇతర దేశాల్లో స్థానిక సహాయం కోసం findahelpline.com చూడండి.")
            response = (
                "మీరు ఇంత బాధలో ఉన్నందుకు నాకు చాలా బాధగా ఉంది. ఈ విషయం నాతో పంచుకున్నందుకు సంతోషం. "
                "ఇప్పుడు మీ భద్రతే అన్నింటికంటే ముఖ్యం, ఆధ్యాత్మిక సమాధానం కంటే కూడా.\n\n"
                "ఈ భావాలతో మీరు ఏదైనా చేసే అవకాశం ఉన్నా, లేదా ఇప్పటికే మిమ్మల్ని మీరు గాయపరచుకున్నా, "
                "వెంటనే మీ స్థానిక అత్యవసర నంబరుకు కాల్ చేయండి లేదా సమీపంలోని అత్యవసర విభాగానికి వెళ్ళండి. "
                "వీలైతే మీకు హాని కలిగించగల వస్తువులకు దూరంగా వెళ్ళి, మీకు నమ్మకమైన వ్యక్తిని మీతో ఉండమని అడగండి.\n\n"
                + support + " మీరు దీన్ని ఒంటరిగా ఎదుర్కోవాల్సిన అవసరం లేదు.\n\n"
                "మీరు ఇప్పుడు వెంటనే ప్రమాదంలో ఉన్నారా? మీ దగ్గర ఎవరైనా ఉండగలరా?"
            )
        else:
            support = {
                "IN": "In India, call Tele-MANAS at 14416. For an immediate emergency, call 112.",
                "US": "In the United States, call or text 988. For immediate danger, call 911.",
                "CA": "In Canada, call or text 988. For immediate danger, call 911.",
            }.get(country, "In the US or Canada, call or text 988. In India, call Tele-MANAS at 14416. "
                          "Elsewhere, find local support at findahelpline.com.")
            response = (
                "I am really sorry you are in so much pain. I am glad you told me. "
                "Your immediate safety matters more than finding a spiritual answer.\n\n"
                "If you might act on these feelings or have already hurt yourself, contact local "
                "emergency services or go to the nearest emergency department now. If you can, "
                "move away from anything you could use to hurt yourself and ask a trusted person "
                "to stay with you.\n\n" + support + " You do not have to handle this alone.\n\n"
                "Are you in immediate danger, and is there someone nearby who can stay with you?"
            )
        return {
            "response": response,
            "mode": "care-first",
            "provider": "safety",
            "verses": [],
            "understanding": {"crisis_risk": True}
        }

    def _mood(self, feeling: str, language: str) -> dict:
        """One short soothing paragraph for the overview mood buttons (no verse text, no history)."""
        where = ("fluent, natural Telugu script (తెలుగు)" if language == "te" else "English")
        system = (
            "You are Gita AI. The user picked a feeling on the home screen. Write ONE short, soothing "
            f"paragraph (2 to 3 sentences) in {where} that applies the essence of the Bhagavad Gita to that "
            "feeling. Speak gently and directly to the user. Do not quote Sanskrit or verse text, and do not "
            "use headings, lists, quotation blocks, Markdown, or questions. Do not write verse numbers in the "
            "text. If you are certain of one fitting verse, put only its number in cited_verse_ids.\n\n"
            "Return ONLY a JSON object, no code fences: "
            "{\"intent\": \"guidance\", \"content\": \"<paragraph>\", \"cited_verse_ids\": [\"2.47\"]}"
        )
        messages = [{"role": "user", "content": f"The user is feeling: {feeling.strip()}"}]
        try:
            data = self.providers.json_response(system, messages, max_tokens=1500, timeout=30.0)
            parsed = _parse_llm(data, default_intent="guidance")
        except Exception as e:
            logger.error("LLM Generation error in Gita AI (mood): %r", e)
            raise
        verses = []
        for vid in parsed.cited_verse_ids:
            clean_id = vid.replace("BG", "").strip()
            if clean_id in self.by_id and not any(v["id"] == clean_id for v in verses):
                verses.append(self.by_id[clean_id])
        return {
            "response": parsed.content,
            "provider": self.providers.provider,
            "mode": "guidance",
            "verses": verses[:1],
            "understanding": {"intent": "guidance", "crisis_risk": False},
        }

    def run(self, query: str, history: Optional[list[dict]] = None, country: str = "global",
            language: str = "en", purpose: str = "chat") -> dict:
        if purpose == "mood":
            return self._mood(query, language)

        history = (history or [])[-12:]

        # The canned care message is only for the message being sent right now.
        if crisis_detected(query):
            care_language = "te" if (language == "te" or has_telugu(query)) else "en"
            return self.care_first(country, care_language)

        earlier_user_text = " ".join(m["content"] for m in history if m["role"] == "user")
        safety_note = SAFETY_NOTE if crisis_detected(earlier_user_text) else ""

        if language == "te":
            language_directive = (
                "LANGUAGE: The user has switched to Telugu mode. Write your ENTIRE reply in fluent, natural "
                "Telugu script (తెలుగు), warm and wise in tone. Use English letters only for verse numbers "
                "(e.g. [BG 2.47]) and for Sanskrit words in transliteration. If the user explicitly asks for "
                "another language, follow that.\n\n"
            )
        else:
            language_directive = (
                "LANGUAGE: Reply in English, even if the user writes in Telugu or Tenglish, unless they "
                "explicitly ask for another language.\n\n"
            )

        focus = self._focus_ids(query, history)
        named = self._find_ids(query, allow_bare=True)
        candidates = [] if named else [c for c in self._search(query) if c not in focus]
        
        system_instruction = (PROMPT_INTRO + language_directive + safety_note + PROMPT_RULES
                              + self._reference_block(focus, candidates))

        messages = [{"role": m["role"], "content": m["content"]} for m in history]
        messages.append({"role": "user", "content": query})

        try:
            data = self.providers.json_response(system_instruction, messages, max_tokens=3500, timeout=40.0)
            parsed = _parse_llm(data, default_intent="conversational")
        except Exception as e:
            logger.error("LLM Generation error in Gita AI: %r", e)
            raise

        content = self._expand_quotes(parsed.content, language)

        resolved_verses: list[dict] = []
        for vid in parsed.cited_verse_ids:
            clean_id = vid.replace("BG", "").strip()
            if clean_id in self.by_id and not any(v["id"] == clean_id for v in resolved_verses):
                resolved_verses.append(self.by_id[clean_id])
        for vid in CITATION.findall(content):
            if vid in self.by_id and not any(v["id"] == vid for v in resolved_verses):
                resolved_verses.append(self.by_id[vid])

        return {
            "response": content,
            "provider": self.providers.provider,
            "mode": parsed.intent,
            "verses": resolved_verses,
            "understanding": {"intent": parsed.intent, "crisis_risk": False},
        }