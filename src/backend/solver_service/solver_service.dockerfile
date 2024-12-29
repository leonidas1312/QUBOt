# /src/backend/solver_service/solver_service.dockerfile
FROM python:3.11-slim

WORKDIR /app

# (Optional) If you need solver-specific dependencies:
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Flask directly
RUN pip install --no-cache-dir flask

# Copy the solver_runner script
COPY solver_runner.py .

EXPOSE 5000

CMD ["python", "solver_runner.py"]
