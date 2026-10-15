"""Small synchronous adapters. API credentials never enter the frontend."""
import json
import logging
import os
import re
import httpx

logger = logging.getLogger("gita.providers")

def _env_model(name: str) -> str | None:
    value = os.getenv(name, "").strip()
    return value or None

def _clean_turns(messages: list[dict]) -> list[dict]:
    """Merge consecutive same-role turns and make sure the conversation starts with the user."""
    turns: list[dict] = []
    for m in messages:
        role = "assistant" if m.get("role") == "assistant" else "user"
        text = str(m.get("content", "")).strip()
        if not text:
            continue
        if turns and turns[-1]["role"] == role:
            turns[-1]["content"] += "\n\n" + text
        else:
            turns.append({"role": role, "content": text})
    while turns and turns[0]["role"] != "user":
        turns.pop(0)
    return turns


class ProviderManager:
    def __init__(self, force_offline: bool = False):
        self.keys = {
            name: os.getenv(f"{name.upper()}_API_KEY", "").strip()
            for name in ("gemini", "groq", "openai")
        }
        self.models = {
            "gemini": _env_model("GEMINI_MODEL"),
            "groq": _env_model("GROQ_MODEL"),
            "openai": _env_model("OPENAI_MODEL"),
        }
        requested = os.getenv("LLM_PROVIDER", "auto").lower().strip()
        if requested not in {"auto", "offline", "gemini", "groq", "openai"}:
            raise ValueError("LLM_PROVIDER must be auto, offline, gemini, groq, or openai.")
        
        if force_offline or requested == "offline":
            self.provider = "offline"
        elif requested == "auto":
            self.provider = next((name for name in self.keys if self.keys[name]), "offline")
        else:
            if self.keys[requested]:
                self.provider = requested
            else:
                logger.warning(
                    "LLM_PROVIDER=%s was requested but %s_API_KEY is missing/empty; using offline mode.",
                    requested, requested.upper()
                )
                self.provider = "offline"
                
        self.model = self.models.get(self.provider)
        if self.provider != "offline" and not self.model:
            raise ValueError(
                f"{self.provider.upper()}_MODEL must be set in your .env file "
                f"(no default model is hardcoded)."
            )
        self.client = httpx.Client(timeout=httpx.Timeout(25.0, connect=5.0))

    def json_response(self, system: str, messages: list[dict], max_tokens: int = 2300,
                      timeout: float = 25.0) -> dict:
        if self.provider == "offline":
            raise RuntimeError("No generation provider is configured.")
        turns = _clean_turns(messages)
        if not turns:
            raise ValueError("No user message to send.")
        
        if self.provider == "gemini":
            model = self.model.removeprefix("models/")
            config = {
                "temperature": 0.25,
                "maxOutputTokens": max_tokens,
                "responseMimeType": "application/json",
            }
            thinking_level = os.getenv("GEMINI_THINKING_LEVEL", "").strip().lower()
            if thinking_level:
                config["thinkingConfig"] = {"thinkingLevel": thinking_level}

            response = self.client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                headers={"x-goog-api-key": self.keys["gemini"]},
                json={
                    "systemInstruction": {"parts": [{"text": system}]},
                    "contents": [
                        {"role": "user" if t["role"] == "user" else "model",
                         "parts": [{"text": t["content"]}]}
                        for t in turns
                    ],
                    "generationConfig": config,
                },
                timeout=timeout,
            )
            try:
                response.raise_for_status()
            except httpx.HTTPStatusError as e:
                raise RuntimeError(f"{self.provider} API {e.response.status_code}: {e.response.text[:500]}") from e
            
            data = response.json()
            candidates = data.get("candidates") or []
            if not candidates:
                raise ValueError(f"Gemini returned no candidates. Feedback: {data.get('promptFeedback')}")
            
            parts = candidates[0].get("content", {}).get("parts", [])
            output = "".join(part.get("text", "") for part in parts if not part.get("thought"))
            finish = candidates[0].get("finishReason", "") or ""
        else:
            base = (
                "https://api.groq.com/openai/v1"
                if self.provider == "groq"
                else "https://api.openai.com/v1"
            )
            body = {
                "model": self.model,
                "messages": [{"role": "system", "content": system}, *turns],
                "temperature": 0.25,
                "response_format": {"type": "json_object"},
                "max_completion_tokens": max_tokens,
            }
            response = self.client.post(
                base + "/chat/completions",
                headers={"Authorization": f"Bearer {self.keys[self.provider]}"},
                json=body,
                timeout=timeout,
            )
            try:
                response.raise_for_status()
            except httpx.HTTPStatusError as e:
                raise RuntimeError(f"{self.provider} API {e.response.status_code}: {e.response.text[:500]}") from e
            choice = response.json()["choices"][0]
            output = choice["message"].get("content")
            finish = choice.get("finish_reason", "") or ""

        cut = finish in ("MAX_TOKENS", "length")
        if not isinstance(output, str) or not output.strip():
            if cut:
                raise RuntimeError("The AI ran out of tokens before answering. Please try again.")
            raise ValueError("Provider returned no text.")

        output = re.sub(r"^```(?:json)?\s*|\s*```$", "", output.strip())
        output = re.sub(r",\s*([\]}])", r"\1", output)
        try:
            parsed = json.loads(output, strict=False)
        except json.JSONDecodeError as e:
            raise RuntimeError(
                "The AI answer was cut off by the token limit. Please try again." if cut
                else "The AI returned invalid JSON. Please try again."
            ) from e
        
        if not isinstance(parsed, dict):
            raise ValueError("Provider must return a JSON object.")
        return parsed

    def close(self):
        self.client.close()

    def switch_provider(self, new_provider: str) -> bool:
        new_provider = new_provider.lower().strip()
        if new_provider not in {"gemini", "groq", "openai"}:
            return False
        if not self.keys.get(new_provider):
            logger.warning(f"Cannot switch to {new_provider}: API key is missing.")
            return False
        if not self.models.get(new_provider):
            logger.warning(f"Cannot switch to {new_provider}: {new_provider.upper()}_MODEL is not set.")
            return False
        self.provider = new_provider
        self.model = self.models[new_provider]
        return True