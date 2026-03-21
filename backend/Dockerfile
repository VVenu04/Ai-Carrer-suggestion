# Use this Dockerfile only when Docker **build context** is the `backend/` folder
# (e.g. Railway **Root Directory** = `backend`). For monorepo root context, use the
# `Dockerfile` at the repository root instead.
#
# Avoids Railpack build-time OPENROUTER_API_KEY secret issues when using Docker.
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
ENV PORT=8000

# Railway sets $PORT at runtime
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
