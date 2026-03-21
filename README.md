# Career Guidance AI (Voice + OpenRouter + SQLite)

## What this app does
Students answer a short set of questions (voice using Web Speech API, or typing). The backend sends the answers to the OpenRouter API and returns **3–5 career suggestions** with:
- Description
- Required skills
- Future demand
- Suggested learning path

Results are saved in **SQLite** and shown on the output page. You can also:
- Read results aloud (TTS)
- Download results as a PDF
- Ask follow-up questions in a chatbot (saved session context)
- Use **English** and **Tamil** (UI + TTS/STT + AI output)

## Folder structure
- `backend/`
  - `app/main.py` (FastAPI app + routes)
  - `app/config.py` (env settings)
  - `app/services/openrouter_client.py` (OpenRouter API client)
  - `app/services/career_prompt.py` (prompt templates)
  - `app/db/db.py` + `app/db/repositories.py` (SQLite init + persistence)
  - `app/routes/ai.py` (career suggestions endpoint)
  - `app/routes/chat.py` (chatbot endpoint)
  - `app/routes/sessions.py` (fetch saved session)
  - `requirements.txt`
- `frontend/`
  - `index.html` (home/questions/results UI)
  - `styles.css` (modern student-friendly styling + animations)
  - `app.js` (page logic + voice flow orchestration)
  - `voice.js` (Web Speech API TTS + STT)
  - `api.js` (frontend -> backend calls)
  - `chat.js` (chat message rendering helpers)
  - `pdf.js` (PDF generation via jsPDF)
  - `i18n.js` (English/Tamil strings)

## Setup (backend)
1. Create a virtual environment inside `backend/`
   - `python -m venv .venv`
   - Activate:
     - Windows (PowerShell): `.venv\Scripts\activate`
     - macOS/Linux: `source .venv/bin/activate`
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Create `backend/.env` with:
   - `OPENROUTER_API_KEY=YOUR_KEY`
   - (optional) `OPENROUTER_MODEL=openai/gpt-4o-mini`
4. Run the backend:
   - `uvicorn app.main:app --reload --port 8000`

## Setup (frontend)
1. Serve the `frontend/` folder with a simple server:
   - From `frontend/`: `python -m http.server 5173`
2. Open:
   - `http://localhost:5173`

## Manual test checklist (end-to-end)
1. Backend starts successfully on `http://localhost:8000`.
2. Frontend loads on `http://localhost:5173`.
3. Typing flow:
   - Click `Start Career Guidance`
   - Fill all 7 answers
   - Click `Next` until results appear
   - Verify 3–5 career cards render
   - Verify chatbot works (send a follow-up question)
   - Click `Download PDF` and confirm a PDF downloads
4. Voice flow:
   - Switch to English (optional)
   - Click the microphone on the home page
   - Confirm questions are spoken (TTS)
   - Confirm answers are captured (STT) and that `Next` confirms each step
   - Verify results render and `Read aloud` speaks the output
5. Tamil flow:
   - Switch language to `தமிழ்`
   - Start guidance again (typing or voice)
   - Verify UI prompts are Tamil and career suggestions are Tamil
6. Failure cases:
   - Temporarily set an invalid `OPENROUTER_API_KEY`
   - Verify the UI shows an error toast instead of silently failing
   - Use a browser without SpeechRecognition support and verify the app shows the “type your answer” hint

## Deploy (Vercel — frontend only)

This repo includes **`vercel.json`** at the project root so Vercel publishes the **`frontend/`** folder (fixes **404 NOT_FOUND** when the repo root had no `index.html`).

1. Import the repo in Vercel (root stays the **repository root** — do not set Root Directory to `frontend` unless you remove or adjust `vercel.json`).
2. **Backend** is not run by this static deploy. Host FastAPI elsewhere (Render, Railway, Fly.io, etc.) and allow CORS for your Vercel domain.
3. Point the UI at your API:
   - Edit **`frontend/index.html`**: set `<meta name="career-api-base" content="https://your-api.example.com" />` (no trailing slash), **or**
   - Before `api.js` loads, set `window.API_BASE = "https://your-api.example.com"` in an inline script.

## Deploy (Railway — backend)

1. **Root Directory:** leave **empty** / **repository root** (recommended). **`railway.toml`** forces the root **`Dockerfile`**, which copies `backend/` — this avoids Railway picking **`backend/Dockerfile`** with the wrong context (`requirements.txt: not found`).
2. **Root Directory = `backend` only:** then **`backend/Dockerfile`** is correct (`COPY requirements.txt .`). Remove or adjust **`railway.toml`** if it conflicts, or rely on that layout only.
3. **Docker** (not Railpack) avoids `secret OPENROUTER_API_KEY: not found` during build. Leave **Custom Start Command** empty so the image `CMD` runs, unless the UI requires an explicit uvicorn line.
4. **`GET /health`** — liveness check; **`railway.toml`** healthcheck uses it. Image sets **`SQLITE_PATH=/tmp/career_app.sqlite`** so SQLite is writable in the container.
5. Add **`OPENROUTER_API_KEY`** (and optionally **`OPENROUTER_MODEL`**) in **Variables** — never commit real keys.
6. **`backend/.env.example`** has no `OPENROUTER_API_KEY=...` assignment line (comments only).

### Railway `502` — "Application failed to respond"

Railway’s proxy often **times out around ~60s** while your app waits on **OpenRouter**. Then the browser/Postman sees **502**, not your FastAPI JSON error.

- Confirm **`GET /health`** is fast; use **`POST /api/career-suggestions`** (not GET) with JSON.
- **Public domain port** must match **`PORT`** in the container.
- This repo: **`OPENROUTER_HTTP_TIMEOUT`** (default **55**s per outbound call), smaller career **`max_tokens`**, and **no JSON fix-up retry on Railway** by default (`RAILWAY_ENVIRONMENT` set) to stay under the edge limit. To allow the second fix-up call, set **`OPENROUTER_ALLOW_JSON_RETRY=1`** (may 502 if the model is slow).

## Notes
- Voice recognition can require a Chromium-based browser and sometimes a secure context; Chrome usually works best locally on `localhost`.
- The app uses permissive CORS (`*`) to simplify local testing.

