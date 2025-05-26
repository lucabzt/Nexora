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

# Create a non-root user
RUN addgroup --system app && adduser --system --group app

# Set work directory
WORKDIR /home/app/web

# Copy pre-built wheels and install
COPY --from=builder /usr/src/app/wheels /wheels
COPY --from=builder /usr/src/app/requirements.txt .
RUN pip install --no-cache /wheels/*

# Copy project
COPY ./src ./app

# If you have a .env file you want to include in the image (NOT RECOMMENDED for secrets)
# COPY ./.env ./.env

# Chown the directory to the app user
RUN chown -R app:app /home/app/web

# Switch to the non-root user
USER app

# Expose port (ensure this matches the port Uvicorn runs on in run.py or directly)
EXPOSE 8000

# Command to run the application
# The run.py script handles Uvicorn with reload, which is fine for development.
# For production, you might run uvicorn directly with more workers.
# CMD ["python", "run_dev.py"]
# Alternatively, for production with multiple workers:
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]