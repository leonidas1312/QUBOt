# /src/backend/solver_service/solver_service.dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install additional packages needed for solver execution
RUN pip install --no-cache-dir \
    numpy \
    flask \
    python-dotenv \
    supabase

# Copy the solver runner script
COPY solver_runner.py .

EXPOSE 5000

# Use environment variables from docker-compose
ENV SUPABASE_URL=${SUPABASE_URL}
ENV SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
ENV SUPABASE_DB_URL=${SUPABASE_DB_URL}

CMD ["python", "solver_runner.py"]