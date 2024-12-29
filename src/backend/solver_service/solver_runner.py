# /src/backend/solver_service/solver_runner.py

import base64
import json
import os
import subprocess
import sys
import importlib.util
import io

from flask import Flask, request, jsonify
import numpy as np

app = Flask(__name__)

@app.route("/", methods=["POST"])
def run_solver():
    """Receives solver code + dataset + parameters, executes them, returns result."""
    try:
        data = request.get_json()
        solver_b64 = data["solver"]
        dataset_b64 = data["dataset"]
        parameters = data.get("parameters", {})

        # 1. Write the solver file
        solver_code = base64.b64decode(solver_b64).decode("utf-8")
        with open("solver.py", "w") as f:
            f.write(solver_code)

        # 2. Decode the dataset
        dataset_bytes = base64.b64decode(dataset_b64)
        QUBO_matrix = np.load(io.BytesIO(dataset_bytes))

        # 3. Dynamically load the solver module
        spec = importlib.util.spec_from_file_location("solver", "./solver.py")
        solver_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(solver_module)

        # We expect a function "solve(QUBO_matrix, **params)" or similar
        # or "solve(qubo_matrix, constant=0, ...)"
        # We'll just assume the user has that function name "solve".
        solve_func = getattr(solver_module, "solve", None)
        if not solve_func:
            return jsonify({
                "error": "No `solve` function found in solver.py"
            }), 400

        # 4. Call the solver function
        # Some solvers might have a signature like "solve(qubo_matrix, c=0, ...)"
        # We'll do best to pass parameters as kwargs
        result = solve_func(QUBO_matrix, **parameters)

        # We expect a tuple or something. Let's standardize on a return like:
        # (best_solution, best_cost, cost_per_iter, elapsed_time)
        # But it could be anything, so let's just pass it back as JSON-serializable.
        # We'll attempt to convert arrays to lists if needed.

        def make_serializable(x):
            """Helper to convert numpy arrays or other non-serializable objects."""
            if isinstance(x, np.ndarray):
                return x.tolist()
            return x

        if isinstance(result, tuple) or isinstance(result, list):
            # Convert each element if needed
            result_serializable = [make_serializable(r) for r in result]
        else:
            # Could be just a single object or dict
            if isinstance(result, dict):
                # convert any arrays inside
                for k,v in result.items():
                    result[k] = make_serializable(v)
                result_serializable = result
            else:
                result_serializable = make_serializable(result)

        return jsonify({
            "ok": True,
            "solver_output": result_serializable
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
