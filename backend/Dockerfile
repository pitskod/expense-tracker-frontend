# Use Python 3.12 slim image as base
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install build dependencies and curl for health check
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir uv

# Copy dependency files
COPY pyproject.toml uv.lock alembic.ini entrypoint.sh ./

COPY migrations ./migrations

# Install uv and project dependencies including uvicorn
RUN uv sync --frozen --no-dev


# Copy the rest of the application
COPY ./app .

# Make entrypoint.sh executable
RUN chmod +x ./entrypoint.sh

# Expose the port the app runs on
EXPOSE 8000

# Command to run the entrypoint script
CMD ["bash", "./entrypoint.sh"]
