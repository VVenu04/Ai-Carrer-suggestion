# Monorepo root: Railway often uses the repo root as Docker build context.
# Paths are relative to this folder (not `backend/`).
FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir --root-user-action=ignore -r requirements.txt

COPY backend/ .

# Writable DB path in container (default config put DB under / — can fail on some hosts).
ENV PYTHONUNBUFFERED=1
ENV SQLITE_PATH=/tmp/career_app.sqlite
EXPOSE 8000
ENV PORT=8000

# `exec` so uvicorn is PID 1 (signals). 0.0.0.0 + proxy flags match Railway's reverse proxy.
CMD exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --proxy-headers --forwarded-allow-ips='*'
