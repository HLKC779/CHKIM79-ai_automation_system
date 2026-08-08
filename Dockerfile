FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install additional integration dependencies
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn[standard] \
    pika \
    redis \
    kafka-python \
    psycopg2-binary \
    prometheus-client \
    ariadne

# Copy application code
COPY financial_system.py .
COPY backend_integration_guide.py .

# Create directories for data and models
RUN mkdir -p /data /models

# Expose ports
EXPOSE 8000

# Default command
CMD ["python", "-m", "uvicorn", "backend_integration_guide:api.app", "--host", "0.0.0.0", "--port", "8000"]