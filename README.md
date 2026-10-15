# Gita AI: A Personal Sanctuary

A single-file Vanilla JavaScript frontend with an optional, stateless FastAPI backend.
No database, ORM, login, accounts, or server-side personal history.

## Flat Structure

index.html          Entire frontend: HTML, CSS, Vanilla JavaScript, localStorage
app.py              Stateless API routes, validation, explicit CORS
rag_pipeline.py     Understanding, themes, hybrid retrieval, strategy, generation, safety
ai_providers.py     Gemini, Groq, OpenAI REST adapters and optional embeddings
gita.json           Full static corpus, 701 verses (if downloaded successfully)
bootstrap.py        One-time corpus acquisition and validation
test_rag.py         Offline tests
requirements.txt    Four small runtime dependencies
.env.example        Optional provider keys and configuration
README.md           This guide

All frontend assets and application code are in index.html; no build step is needed.
The Python files are embedded as inert text in the single frontend and exported by
Settings > Download Python backend. They are not a Python server running inside a browser.

## Run

Use Python 3.10 or newer.

1. Unzip this package. Place the supplied index.html in the same flat directory.
2. Create a virtual environment: python -m venv .venv
3. Activate it: source .venv/bin/activate (Windows: .venv\Scripts\activate).
4. Install: pip install -r requirements.txt
5. If gita.json is absent, run: python bootstrap.py
6. Copy .env.example to .env. Keys are OPTIONAL. Never put keys in frontend code.
7. Start: uvicorn app:app --host 127.0.0.1 --port 8000
8. Open http://localhost:8000 and use Settings > Test & connect.
9. Run offline tests: python -m unittest test_rag

The backend is not deployed by the frontend. Start it yourself using the command above.
An external frontend may connect after its exact origin is added to ALLOWED_ORIGINS.
This unauthenticated single-user API is for a trusted local machine, not public exposure.
Serving this app over HTTPS while using a plain HTTP remote API may be blocked by the browser.

## API

GET  /api/health    Provider configuration, corpus count, static embedding status
GET  /api/verses    Public static corpus only
POST /api/chat     JSON: query (1..4000 chars), history (at most 12 user/assistant messages),
                   country (global, IN, US, CA, or other)
GET  /api/docs      Interactive OpenAPI documentation

Chat response includes response, understanding, mode, provider, verses, retrieval,
and safety_override. Provider identifies the generator actually used, including fallback.
The client passes a bounded recent context with each request; the API keeps no session.

## The Six Stages

1. Understand (Manas): validated JSON with mindset, needs, scored emotions,
   primaryEmotion, intent, domains, guna, crisis_risk, refined_query, and themes.
   With no keys or provider failure, use deterministic keyword-based understanding.
2. Themes: curated everyday concerns linked to real anchor verses.
3. Retrieval: local BM25 over English and Sanskrit glosses, theme anchors, and
   optional semantic cosine retrieval. Weighted RRF uses k=60 and weights 1.0 / 1.1 / 1.15.
4. Strategy: counsel, teach, verse study, discernment, practice, or care-first;
   tone adapts to tentative guna and emotions.
5. Generation: validated structured provider output. All references must belong
   to retrieval. Quotes are inserted verbatim from gita.json, never generated.
   Invalid output, unknown citations, network errors, or rate limits fall back to templates.
6. Safety and memory: risk overrides normal guidance with practical crisis support
   and regional helplines. Recent request context may maintain a care-first response.
   No user content is written to disk or a database by this application.

Safety runs early too, to avoid sending clear crisis text to a generation provider.
Risk rules are conservative heuristics, not a comprehensive crisis detection system.
Emotion scores are estimates, not clinical probabilities. Gita AI is not medical care.
Reference checking prevents unknown IDs; it cannot prove that every interpretation
of a retrieved passage is factually or theologically correct.

## Providers

LLM_PROVIDER=auto selects the first available key: Gemini, Groq, then OpenAI.
Choose a named provider to pin it. No key means Offline Wisdom. Use offline to
disable generation and embeddings even if keys are present.
Gemini defaults to gemini-2.5-flash. Set GEMINI_MODEL to another valid account model.
Groq defaults to llama-3.3-70b-versatile. OpenAI defaults to gpt-4o-mini.
Custom model IDs must support the same JSON and chat endpoints.

EMBEDDING_PROVIDER=none disables vector APIs by default to avoid surprise charges.
Set gemini or openai to enable semantic retrieval. A static 701-verse vector index
warms in a background thread. Queries use lexical + graph retrieval while it warms.
The vector cache contains only public scripture and is rebuilt after a restart.
If embedding APIs fail, lexical and graph retrieval still work.

## Browser Data and Privacy

Personal resources use gita.sanctuary.v1 in localStorage; public scripture is cached
separately under gita.corpus.v1. Journals, check-ins, and bookmarks are never sent
to the backend. Connected chats send query and recent conversation context to the
configured server and, when enabled, its provider. Provider retention policies apply.
No analytics or telemetry is included. The initial font, Tailwind CDN, landscape
image, and public corpus requests do expose standard network metadata to their hosts.

The two first-load journal entries are labeled starter reflections, not a demo account.
All core resources support creation, viewing, editing, and deletion. Backups are
validated before import; imports reset provider connections and strip untrusted
response metadata. Text is rendered as text, never as unsanitized user HTML.
Storage is not encrypted and is specific to the browser profile and origin.
Clearing browser data removes it. Use the export feature for a durable backup.
Deleting an origin's local data does not delete copies made in other origins or exports.

## Offline Behavior

The frontend includes 30 clearly labeled plain-language anchor verse renderings.
It loads and caches the complete public-domain collection when network access is
available. A failed corpus request leaves the 30-verse collection fully usable.
Library and Settings distinguish starter coverage from the complete collection.
The backend always requires the validated full 701-verse static gita.json.
Once downloaded and dependencies installed, a key-free backend needs no network.
The frontend core is inline; fonts, image, and the requested Tailwind CDN are external.
No service worker is included, so reopening a remote page fully offline depends on
browser caching. A locally saved index.html can run without a server in offline mode.

## Corpus Credits

Sanskrit: ancient public-domain text, gita/gita, data/verse.json text field,
under The Unlicense. No modern copyrighted commentaries are bundled.
English: Annie Besant, The Bhagavad-Gita, 4th edition (1922), public domain,
transcribed at https://en.wikisource.org/wiki/Bhagavad-Gita_(Besant_4th)
Full aligned dataset: https://github.com/ravitejakamalapuram/GitaVerses
Credits: https://github.com/ravitejakamalapuram/GitaVerses/blob/main/CREDITS.md
Transliteration: mechanically generated from Sanskrit by the upstream project.
Sanskrit keyword glosses: a small, curated vocabulary for retrieval, not a complete
word-by-word scholarly translation. Every English translation is still indexed.
This recension includes Arjuna's first verse in chapter 13: 701 total verses.
The overview quote and 30 bundled fallback translations are labeled plain-language
renderings. Interpretive templates are companion reflections, not canonical commentary.
Mountain photography: Etem Kocak, Pexels image 34995709.

## Verification

Use the included Python unit tests and Settings > Application checks for diagnostics.
Live provider calls require your credentials; they are not pre-verified or deployed.
No guarantee is made that a provider model is available to every account.
