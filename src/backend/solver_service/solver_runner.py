from flask import Flask, request, jsonify
import numpy as np
import os
from supabase import create_client
import importlib.util
import sys
import tempfile
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def download_file(supabase, bucket: str, path: str):
    """Download file from Supabase storage and save it to a temporary file."""
    try:
        logger.info(f"Attempting to download '{path}' from bucket '{bucket}'")
        # Download the file as bytes
        file_bytes = supabase.storage.from_(bucket).download(path)
        if not file_bytes:
            raise ValueError("Downloaded file is empty or None")
        
        # Create a temporary file to store the bytes
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(path)[1]) as temp_file:
            temp_file.write(file_bytes)
            temp_path = temp_file.name
            logger.info(f"File downloaded successfully and saved to '{temp_path}'")
            return temp_path
    except Exception as e:
        logger.error(f"Error downloading file '{path}' from bucket '{bucket}': {str(e)}")
        raise

@app.route('/solve', methods=['POST'])
def solve():
    try:
        data = request.json
        logger.info(f"Received data: {data}")

        # Validate incoming data
        required_fields = ['supabaseUrl', 'supabaseKey', 'solverPath', 'datasetPath']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")

        # Initialize Supabase client
        supabase = create_client(
            data.get('supabaseUrl'),
            data.get('supabaseKey')
        )
        logger.info("Supabase client initialized successfully.")

        # Download solver code
        solver_path = data.get('solverPath')
        temp_solver_path = download_file(supabase, 'solvers', solver_path)

        # Download dataset
        dataset_path = data.get('datasetPath')
        temp_dataset_path = download_file(supabase, 'datasets', dataset_path)

        try:
            # Load the QUBO matrix
            logger.info(f"Loading QUBO matrix from '{temp_dataset_path}'")
            qubo_matrix = np.load(temp_dataset_path)
            logger.info("QUBO matrix loaded successfully.")

            # Dynamically load the solver module
            logger.info(f"Loading solver module from '{temp_solver_path}'")
            spec = importlib.util.spec_from_file_location("solver_module", temp_solver_path)
            if spec is None:
                raise ImportError(f"Could not load spec from '{temp_solver_path}'. Ensure it's a valid Python module.")

            solver_module = importlib.util.module_from_spec(spec)
            sys.modules["solver_module"] = solver_module
            if spec.loader is None:
                raise ImportError(f"Spec loader is None for '{temp_solver_path}'.")

            spec.loader.exec_module(solver_module)
            logger.info("Solver module loaded successfully.")

            # Execute the solver
            parameters = data.get('parameters', {})
            logger.info(f"Executing solver with parameters: {parameters}")
            result = solver_module.solve(qubo_matrix, parameters)
            logger.info("Solver executed successfully.")

            return jsonify(result)

        finally:
            # Clean up temporary files
            logger.info(f"Cleaning up temporary files: '{temp_solver_path}', '{temp_dataset_path}'")
            for temp_path in [temp_solver_path, temp_dataset_path]:
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                    logger.info(f"Deleted temporary file '{temp_path}'")

    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
