# Base Image
FROM python:3.12-slim

WORKDIR /app

COPY scripts/ scripts/

RUN pip install --upgrade pip && \
    pip install -r scripts/requirements.txt

COPY . .

RUN chmod +x scripts/start.sh
CMD ["./scripts/start.sh"]