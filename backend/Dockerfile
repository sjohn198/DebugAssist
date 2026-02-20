FROM python:3.11-slim

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY . .

CMD uvicorn api:app --host 0.0.0.0 --port ${PORT:-10000}