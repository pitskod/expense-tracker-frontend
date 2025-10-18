#!/bin/sh
set -e

source .venv/bin/activate

# Run Alembic migrations
uv run alembic upgrade head

# Start the application server
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

