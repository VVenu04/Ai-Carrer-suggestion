# Use when Railway **Root Directory** is set to `backend` (build context = this folder).
# If Root Directory is the **repo root**, Railway should use the root `Dockerfile` + `railway.toml`.
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
ENV PORT=8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
