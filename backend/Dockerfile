# Use when Railway **Root Directory** is set to `backend` (build context = this folder).
# If Root Directory is the **repo root**, Railway should use the root `Dockerfile` + `railway.toml`.
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --root-user-action=ignore -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1
ENV SQLITE_PATH=/tmp/career_app.sqlite
EXPOSE 8000
ENV PORT=8000

CMD exec uvicorn app.main:app --host :: --port "${PORT:-8000}"
