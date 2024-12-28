FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy solver and dataset files (will be mounted at runtime)
COPY solver.py .
COPY dataset.npy .

# Run the solver
CMD ["python", "solver.py"]