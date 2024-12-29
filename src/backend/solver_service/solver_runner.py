import base64
import json
import os
import subprocess
import sys
import importlib.util
import io
import numpy as np
import requests
from flask import Flask, request, jsonify, Response, stream_with_context
from supabase import create_client, Client

CHUNK_SIZE = 1024 * 1024  # 1MB chunks for streaming

app = Flask(__name__)

def stream_dataset(dataset_url):
    """Stream large dataset in chunks"""
    response = requests.get(dataset_url, stream=True)
    if not response.ok:
        raise Exception(f"Failed to download dataset: {response.status_code}")
    
    # Create a buffer to accumulate chunks
    buffer = io.BytesIO()
    
    # Stream and process the data in chunks
    for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
        if chunk:
            buffer.write(chunk)
    
    # Reset buffer position
    buffer.seek(0)
    return np.load(buffer)

def process_matrix_in_batches(matrix, batch_size=1000):
    """Process large QUBO matrices in batches"""
    total_size = len(matrix)
    for i in range(0, total_size, batch_size):
        yield matrix[i:min(i + batch_size, total_size)]

@app.route("/", methods=["POST"])
def run_solver():
    """Receives solver code + dataset URL + parameters, executes them, returns result."""
    try:
        data = request.get_json()
        solver_b64 = data["solver"]
        dataset_url = data["dataset_url"]
        parameters = data.get("parameters", {})

        # Write the solver file
        solver_code = base64.b64decode(solver_b64).decode("utf-8")
        with open("solver.py", "w") as f:
            f.write(solver_code)

        # Stream and load the dataset
        try:
            QUBO_matrix = stream_dataset(dataset_url)
            print(f"Dataset loaded successfully, shape: {QUBO_matrix.shape}")
        except Exception as e:
            return jsonify({
                "error": f"Failed to load dataset: {str(e)}"
            }), 500

        # Dynamically load the solver module
        spec = importlib.util.spec_from_file_location("solver", "./solver.py")
        solver_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(solver_module)

        solve_func = getattr(solver_module, "solve", None)
        if not solve_func:
            return jsonify({
                "error": "No `solve` function found in solver.py"
            }), 400

        # Process the matrix in batches if it's large
        if QUBO_matrix.size > 1_000_000:  # Threshold for batch processing
            results = []
            for batch in process_matrix_in_batches(QUBO_matrix):
                batch_result = solve_func(batch, **parameters)
                results.append(batch_result)
            
            # Combine batch results (implementation depends on solver output format)
            final_result = results[0] if len(results) == 1 else results
        else:
            final_result = solve_func(QUBO_matrix, **parameters)

        def make_serializable(x):
            if isinstance(x, np.ndarray):
                return x.tolist()
            return x

        if isinstance(final_result, (tuple, list)):
            result_serializable = [make_serializable(r) for r in final_result]
        else:
            if isinstance(final_result, dict):
                result_serializable = {k: make_serializable(v) for k, v in final_result.items()}
            else:
                result_serializable = make_serializable(final_result)

        return jsonify({
            "ok": True,
            "solver_output": result_serializable
        })

    except Exception as e:
        print(f"Error in solver execution: {str(e)}", file=sys.stderr)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)