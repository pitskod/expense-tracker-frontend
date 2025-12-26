# Use Python 3.12 slim image as base
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install build dependencies and curl for health check in a single layer
# Using --mount=type=cache for apt cache to speed up rebuilds
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv with pip cache
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir uv

# Copy dependency files
COPY pyproject.toml uv.lock alembic.ini entrypoint.sh ./

COPY migrations ./migrations

# Install uv and project dependencies including uvicorn
# Use cache mount for uv cache to speed up rebuilds
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev


# Copy the rest of the application
COPY ./app .

# Make entrypoint.sh executable
RUN chmod +x ./entrypoint.sh

# Expose the port the app runs on
EXPOSE 8000

# Command to run the entrypoint script
CMD ["bash", "./entrypoint.sh"]
