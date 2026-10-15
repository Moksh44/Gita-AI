"""Stateless local API. All personal persistence belongs to index.html."""
import json
import time
import os
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field, field_validator

BASE = Path(__file__).resolve().parent
LAST_REQUEST_TIME = 0
LAST_REQUESTS_BY_IP: dict[str, float] = {}
MIN_INTERVAL_SECONDS = 4.0

load_dotenv(BASE / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

from ai_providers import ProviderManager
from rag_pipeline import RagPipeline

try:
    corpus = json.loads((BASE / "gita.json").read_text(encoding="utf-8"))
except FileNotFoundError as exc:
    raise RuntimeError("gita.json is missing. Run: python bootstrap.py") from exc

providers = ProviderManager()
pipeline = RagPipeline(corpus, providers)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    providers.close()


app = FastAPI(title="Gita AI", version="1.0.0", lifespan=lifespan,
              docs_url="/api/docs", redoc_url=None)
origins = [s.strip() for s in os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:8000,http://127.0.0.1:8000,"
    "http://localhost:3000,http://127.0.0.1:3000,"
    "http://localhost:5500,http://127.0.0.1:5500,"
).split(",") if s.strip()]
if "*" in origins:
    raise RuntimeError("List explicit ALLOWED_ORIGINS; a wildcard is not supported.")
app.add_middleware(CORSMiddleware, allow_origins=origins,
                   allow_credentials=False, allow_methods=["GET", "POST"],
                   allow_headers=["Content-Type"])


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=8000)


class ChatRequest(BaseModel):
    query: str = Field(min_length=1, max_length=4000)
    history: list[Message] = Field(default_factory=list, max_length=12)
    country: Literal["global", "IN", "US", "CA", "other"] = "global"
    language: Literal["en", "te"] = "en"
    purpose: Literal["chat", "mood"] = "chat"

    @field_validator("query")
    @classmethod
    def nonempty_query(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Please provide a nonempty query.")
        return value.strip()

    @field_validator("history")
    @classmethod
    def limit_context(cls, value: list[Message]) -> list[Message]:
        if sum(len(m.content) for m in value) > 48000:
            raise ValueError("Conversation context is too large.")
        return value

class ProviderRequest(BaseModel):
    provider: Literal["gemini", "groq", "openai"]
    
@app.get("/api/providers")
def get_providers():
    available = [p for p in ["gemini", "groq", "openai"] if providers.keys.get(p)]
    return {"available": available, "current": providers.provider}

@app.post("/api/provider")
def set_provider(body: ProviderRequest):
    success = providers.switch_provider(body.provider)
    if not success:
        raise HTTPException(400, f"Provider {body.provider} is not configured or lacks an API key.")
    return {"status": "ok", "provider": providers.provider, "model": providers.model}


@app.middleware("http")
async def response_headers(request: Request, call_next):
    if request.method == "POST":
        length = request.headers.get("content-length", "0")
        if length.isdigit() and int(length) > 256000:
            return JSONResponse({"detail": "Request is too large."}, status_code=413)
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    if request.url.path == "/api/verses":
        response.headers["Cache-Control"] = "no-cache"
    elif request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
    return response


@app.get("/api/health")
def health():
    return {"app": "gita-ai", "status": "ok", "verses": len(corpus),
            "provider": providers.provider, "model": providers.model,
            "stateless": True, "stores_personal_data": False}


@app.get("/api/verses")
def verses():
    return corpus

@app.post("/api/chat")
def chat(request: Request, body: ChatRequest):
    forwarded = request.headers.get("x-forwarded-for")
    client_ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "unknown")
    now = time.time()

    if len(LAST_REQUESTS_BY_IP) > 1000:
        cutoff = now - 60.0
        for ip in [ip for ip, t in LAST_REQUESTS_BY_IP.items() if t < cutoff]:
            del LAST_REQUESTS_BY_IP[ip]

    if now - LAST_REQUESTS_BY_IP.get(client_ip, 0.0) < MIN_INTERVAL_SECONDS:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait a few seconds.")
    LAST_REQUESTS_BY_IP[client_ip] = now

    history = [message.model_dump() for message in body.history]
    try:
        return pipeline.run(body.query, history, body.country, body.language, body.purpose)
    except Exception as exc:
        logging.getLogger("gita.api").exception("Generation Failed")
        msg = str(exc)
        if isinstance(exc, RuntimeError):
            if "API 429" in msg:
                detail = "The AI provider's free-tier limit was reached. Wait a minute and try again."
            elif "API 401" in msg or "API 403" in msg:
                detail = f"{providers.provider.upper()} rejected the API key. Check .env or switch provider."
            elif "API 503" in msg:
                detail = "The AI provider is overloaded right now. Try again in a moment."
            else:
                detail = msg[:200]
        else:
            detail = f"{providers.provider.upper()} request failed ({type(exc).__name__})."
        raise HTTPException(status_code=502, detail=detail) from exc

@app.get("/")
@app.get("/index.html")
def frontend():
    path = BASE / "index.html"
    if not path.is_file():
        raise HTTPException(404, "index.html not found")
    return FileResponse(path, media_type="text/html")

@app.get("/styles.css")
def get_css():
    path = BASE / "styles.css"
    if not path.is_file():
        raise HTTPException(404, "styles.css not found beside app.py")
    return FileResponse(path, media_type="text/css")

@app.get("/main.js")
def get_js():
    path = BASE / "main.js"
    if not path.is_file():
        raise HTTPException(404, "main.js not found beside app.py")
    return FileResponse(path, media_type="application/javascript")

@app.get("/voice-input.js")
def get_voice_js():
    path = BASE / "voice-input.js"
    if not path.is_file():
        raise HTTPException(404, "voice-input.js not found beside app.py")
    return FileResponse(path, media_type="application/javascript")

@app.get("/response.css")
def get_responsive_css():
    path = BASE / "response.css"
    if not path.is_file():
        raise HTTPException(404, "responsive.css not found beside app.py")
    return FileResponse(path, media_type="text/css")

@app.get("/gita-banner.jpg")
def get_banner():
    path = BASE / "gita-banner.jpg"
    if not path.is_file():
        raise HTTPException(404, "gita-banner.jpg not found beside app.py")
    return FileResponse(path, media_type="image/jpeg")
