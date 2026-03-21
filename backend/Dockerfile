# Explicit image so Railway uses Docker instead of Railpack (avoids build-time
# OPENROUTER_API_KEY secret injection from auto-detected .env patterns).
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
ENV PORT=8000

# Railway sets $PORT at runtime
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
