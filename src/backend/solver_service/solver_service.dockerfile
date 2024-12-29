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
    supabase \
    requests

# Copy the solver runner script
COPY solver_runner.py .

# Set environment variables for memory management
ENV PYTHONUNBUFFERED=1
ENV MALLOC_TRIM_THRESHOLD_=100000
ENV PYTHONMALLOC=malloc

# Set memory limits for the container (adjust as needed)
ENV MEMORY_LIMIT=8g

EXPOSE 5000

# Use environment variables from docker-compose
ENV SUPABASE_URL=${SUPABASE_URL}
ENV SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
ENV SUPABASE_DB_URL=${SUPABASE_DB_URL}

CMD ["python", "solver_runner.py"]