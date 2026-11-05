# Gita AI

Gita AI is a private, reflective companion for exploring the **Bhagavad Gita** and applying its ideas to everyday life. It combines a responsive browser interface with a small FastAPI backend, retrieval over a structured Gita corpus, and interchangeable AI providers.

The app is designed around a simple principle: use the Gita as a source of reflection, not as a substitute for professional medical, legal, or financial advice.

## Features

- Ask questions about the Bhagavad Gita in a conversational interface
- Explore verses by chapter, theme, search, and saved references
- Request verse explanations, word meanings, context, and practical reflections
- Guidance responses for everyday emotions and situations
- English and Telugu interface/response modes
- Support for English, Telugu script, Tenglish, and Hinglish input
- Mood prompts for quick, gentle reflections
- Personal journal with editable reflections and mood labels
- Saved verses with personal notes
- Multiple conversations with rename and delete controls
- Light, dark, and system theme modes
- Voice input where the browser supports the Web Speech API
- Export and import of local app data as JSON backups
- Full 701-verse corpus across 18 chapters, with a smaller starter set available before the full library loads
- Provider switching between configured Gemini, Groq, and OpenAI backends
- Safety-first handling for messages that indicate immediate self-harm risk

## How it works

```text
Browser UI
  ├─ Local storage: chats, journal entries, bookmarks, settings
  ├─ Local starter verses and optional full corpus loading
  └─ FastAPI requests
        ├─ Retrieval over gita.json
        ├─ Verse-aware prompt construction
        ├─ Configured LLM provider
        └─ Structured response with cited verses
```

The backend is stateless with respect to personal user data. Chat history is sent by the browser only as request context; journals, bookmarks, conversations, and preferences remain in the browser's `localStorage`.

## How the RAG pipeline works

Gita AI uses a lightweight, local retrieval-augmented generation (RAG) pipeline rather than sending every question to the model without context.

1. **Load the corpus:** `gita.json` is loaded when the FastAPI application starts. The corpus contains 701 structured verses with chapter/verse IDs, Sanskrit, transliteration, English and Telugu text, word meanings, and themes.
2. **Recognize direct references:** The pipeline detects references such as `BG 2.47`, `2.47`, “chapter 2 verse 47”, and related Gita/Sloka wording. When a verse is identified, it becomes the primary reference.
3. **Retrieve related verses:** For broader questions, the pipeline tokenizes the query and verse metadata, removes common stop words, and scores matching verses with an IDF-weighted term-frequency ranking. The highest-scoring candidates are included only when they meet the relevance threshold.
4. **Add authoritative context:** The selected verses, their adjacent verses, and any keyword candidates are formatted into separate prompt sections. Directly referenced verses are marked as authoritative; search suggestions are explicitly marked as potentially off-topic.
5. **Generate a structured answer:** The configured Gemini, Groq, or OpenAI-compatible provider receives the conversation history, user question, language instructions, safety context, and retrieved verse context. It must return JSON containing the response intent, Markdown content, and cited verse IDs.
6. **Expand citations safely:** The model uses placeholders such as `[BG 2.47]` instead of writing Sanskrit itself. The server replaces those placeholders with the exact Sanskrit/transliteration/translation from `gita.json`, preventing fabricated or mismatched quotations.
7. **Return citations to the UI:** The API returns the generated response together with the resolved verse objects, allowing the frontend to display the supporting verses and save them.

If a user asks for a specific verse, direct lookup takes priority over keyword search. If no verse is confidently relevant, the model is instructed not to invent a citation. This keeps retrieval helpful while allowing general conversational and reflective questions.

## Technology

- **Frontend:** HTML, CSS, and vanilla JavaScript
- **Backend:** FastAPI, Uvicorn, Pydantic, and HTTPX
- **Retrieval:** Lightweight TF-IDF-style keyword retrieval over the local corpus
- **AI providers:** Gemini, Groq, and OpenAI-compatible chat APIs
- **Data:** `gita.json`, containing 701 structured verses and metadata
- **Fonts:** Google Fonts, loaded by the browser

## Project structure

```text
.
├── app.py             # FastAPI app, validation, CORS, routes, and static files
├── ai_providers.py    # Gemini, Groq, and OpenAI provider adapters
├── rag_pipeline.py    # Verse retrieval, prompting, citations, and safety logic
├── gita.json          # Structured 701-verse corpus
├── index.html         # Application shell and accessible UI markup
├── main.js            # Frontend state, routes, rendering, chat, and persistence
├── voice-input.js     # Browser speech-recognition integration
├── styles.css         # Main application styles
├── response.css       # Responsive layout styles
├── gita-banner.jpg    # Application artwork
├── requirements.txt   # Python dependencies
└── .gitignore         # Local environment and generated-file exclusions
```

## Requirements

- Python 3.10 or newer is recommended
- An API key and model name for at least one supported provider for AI chat
- A modern browser with JavaScript enabled
- Microphone permission for voice input

The app can start without an LLM key in offline mode, but conversational AI requests will not generate answers until a provider is configured.

## Run locally

### 1. Clone the repository

```bash
git clone https://github.com/Moksh44/Gita-AI.git
cd Gita-AI
```

### 2. Create and activate a virtual environment

macOS/Linux:

```bash
python -m venv .venv
source .venv/bin/activate
```

Windows PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 4. Configure an AI provider

Create a `.env` file beside `app.py`. Configure one provider at minimum:

```dotenv
LLM_PROVIDER=gemini

GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=your-gemini-model
```

Alternative providers:

```dotenv
# Use one of: auto, offline, gemini, groq, openai
LLM_PROVIDER=groq

GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=your-groq-model
```

```dotenv
LLM_PROVIDER=openai

OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=your-openai-model
```

Optional Gemini reasoning configuration:

```dotenv
GEMINI_THINKING_LEVEL=low
```

Provider selection behavior:

- `LLM_PROVIDER=auto` selects the first configured provider in Gemini, Groq, OpenAI order.
- `LLM_PROVIDER=offline` disables generation.
- If a requested provider has no key, the backend falls back to offline mode.
- Every non-offline provider requires both its API key and model name.

Never commit `.env` or API keys. `.env` is excluded by `.gitignore`.

### 5. Start the application

```bash
python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

Open <http://127.0.0.1:8000/>.

The backend serves the frontend files itself, so no separate frontend development server is required.

For a non-reloading local run:

```bash
python app.py
```

## Configuration

### CORS

By default, the API allows the local origins below:

- `http://localhost:8000`
- `http://127.0.0.1:8000`
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:5500`
- `http://127.0.0.1:5500`

To serve the UI from another origin, set an explicit comma-separated allow-list:

```dotenv
ALLOWED_ORIGINS=https://your-frontend.example,http://localhost:8000
```

Wildcard origins are intentionally rejected.

### Frontend API URL

When served over HTTP or HTTPS, the frontend uses its current origin as the API base URL. This is the recommended setup because `app.py` serves both the UI and API.

When opening the frontend separately, configure the API URL in the Settings screen, for example:

```text
http://localhost:8000
```

Do not open `index.html` directly with `file://` if you want backend connectivity; serve it over HTTP instead.

## API reference

Interactive OpenAPI documentation is available at:

```text
http://127.0.0.1:8000/api/docs
```

### Health

```http
GET /api/health
```

Returns provider state, corpus size, and the app's statelessness indicators.

Example:

```json
{
  "app": "gita-ai",
  "status": "ok",
  "verses": 701,
  "provider": "gemini",
  "model": "configured-model",
  "stateless": true,
  "stores_personal_data": false
}
```

### Verse corpus

```http
GET /api/verses
```

Returns the validated 701-verse corpus used by the frontend and retrieval pipeline.

### Chat

```http
POST /api/chat
Content-Type: application/json
```

Request fields:

| Field | Type | Description |
| --- | --- | --- |
| `query` | string | User message, 1–4000 characters |
| `history` | array | Up to 12 prior `{role, content}` messages |
| `country` | `global`, `IN`, `US`, `CA`, `other` | Used for crisis-support guidance |
| `language` | `en` or `te` | Response language |
| `purpose` | `chat` or `mood` | Normal conversation or short mood reflection |

Example:

```bash
curl -X POST http://127.0.0.1:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"What does the Gita say about acting without attachment?","history":[],"country":"global","language":"en","purpose":"chat"}'
```

The response contains the generated text, provider, response mode, cited verse objects, and intent/safety metadata:

```json
{
  "response": "...",
  "provider": "gemini",
  "mode": "guidance",
  "verses": [],
  "understanding": {
    "intent": "guidance",
    "crisis_risk": false
  }
}
```

### Provider management

```http
GET  /api/providers
POST /api/provider
```

`GET /api/providers` lists providers with configured keys. To switch:

```bash
curl -X POST http://127.0.0.1:8000/api/provider \
  -H "Content-Type: application/json" \
  -d '{"provider":"groq"}'
```

The provider must have both an API key and model configured.

## Safety and limitations

- Messages matching configured English, Telugu, or Tenglish self-harm indicators receive a direct care-first response rather than an AI-generated spiritual answer.
- Crisis guidance uses the selected country to provide relevant emergency/support contacts.
- Gita AI is not a crisis service and does not replace emergency services, a trusted person, or qualified professional care.
- AI output can be inaccurate or incomplete. Verify important interpretations against a trusted translation or teacher.
- The backend applies a four-second per-IP cooldown to `/api/chat` and rejects oversized POST requests.
- Provider API keys stay on the backend and are never sent to the browser.
- Local browser data can be lost if storage is cleared or unavailable; use the built-in export feature for backups.

## Corpus and attribution

The interface credits the following sources:

- Sanskrit text from `gita/gita` under The Unlicense
- English text from Annie Besant, *The Bhagavad-Gita*, 4th edition (1922), public domain
- Telugu script and translations compiled from public-domain Telugu Bhagavad Gita editions
- Transliteration mechanically derived from the Sanskrit
- Complete English and Sanskrit data maintained by the GitaVerses project

The bundled starter verses are labeled as plain-language renderings where applicable. Interpretive notes are intended for reflection and are not a replacement for studying the text in context.

## Deployment

Use a production ASGI server rather than the development reload server:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

Set the provider secrets and `ALLOWED_ORIGINS` in the hosting platform's environment configuration. Do not place secrets in frontend files or repository commits.

## License

No license file is currently included in this repository. Until a license is added, all rights are reserved by the repository owner, except where third-party source material has its own license or public-domain status as described above.
