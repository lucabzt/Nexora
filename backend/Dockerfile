# Use an official Python runtime as a parent image
FROM python:3.10-slim AS builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /usr/src/app

# Install system dependencies required for some Python packages (if any)
# For example, if you were using psycopg2 for PostgreSQL and needed build tools:
# RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev \
#    && rm -rf /var/lib/apt/lists/*

# Install pipenv (if you were using it, otherwise skip)
# RUN pip install --upgrade pip
# RUN pip install pipenv

# Copy requirements.txt first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /usr/src/app/wheels -r requirements.txt


# --- Final Stage ---
FROM python:3.10-slim

# Install Node.js and npm
RUN apt-get update && apt-get install -y curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create a non-root user with proper home directory
RUN addgroup --system app && adduser --system --group app --home /home/app --shell /bin/bash

# Set up ESLint environment BEFORE switching users
WORKDIR /opt/eslint-setup
COPY ./src/agents/code_checker/package.json ./src/agents/code_checker/eslint.config.js ./
RUN npm install
RUN chown -R app:app /opt/eslint-setup

# Make this directory accessible to your app
RUN chmod -R 755 /opt/eslint-setup

# Set work directory
WORKDIR /home/app/web

# Copy pre-built wheels and install Python dependencies
COPY --from=builder /usr/src/app/wheels /wheels
COPY --from=builder /usr/src/app/requirements.txt .
RUN pip install --no-cache /wheels/*

# Copy project
COPY ./src ./app

# Create npm directories and set proper ownership
RUN mkdir -p /home/app/.npm /home/app/.config \
    && chown -R app:app /home/app \
    && chown -R app:app /home/app/web

# Switch to the non-root user
USER app

# Set npm environment variables
ENV NPM_CONFIG_CACHE=/home/app/.npm
ENV NPM_CONFIG_PREFIX=/home/app/.npm-global
ENV PATH=/home/app/.npm-global/bin:$PATH

EXPOSE 8000
# später workercount per variable setzen
CMD uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers ${WORKERS}