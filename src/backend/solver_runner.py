from flask import Flask, request, jsonify
import numpy as np
import os
from supabase import create_client
import importlib.util
import sys
import tempfile
import logging
import traceback
import inspect
import subprocess

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


def install_requirements(requirements_path: str):
    """Install Python packages from requirements.txt in a virtual environment."""
    try:
        logger.info(f"Creating virtual environment for solver")
        venv_path = tempfile.mkdtemp()
        subprocess.run([sys.executable, "-m", "venv", venv_path], check=True)
        
        # Get path to pip in virtual environment
        if os.name == 'nt':  # Windows
            pip_path = os.path.join(venv_path, 'Scripts', 'pip')
        else:  # Unix/Linux/MacOS
            pip_path = os.path.join(venv_path, 'bin', 'pip')
        
        logger.info(f"Installing requirements from {requirements_path}")
        subprocess.run([pip_path, "install", "-r", requirements_path], check=True)
        
        return venv_path
    except subprocess.CalledProcessError as e:
        logger.error(f"Error installing requirements: {str(e)}")
        raise


@app.route('/solve', methods=['POST'])
def solve():
    temp_paths = []  # Keep track of temporary files to clean up
    venv_path = None  # Keep track of virtual environment to clean up
    
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
        temp_paths.append(temp_solver_path)

        # Download requirements.txt
        requirements_path = f"{solver_path}_requirements.txt"
        temp_requirements_path = download_file(supabase, 'solvers', requirements_path)
        temp_paths.append(temp_requirements_path)

        # Create virtual environment and install requirements
        venv_path = install_requirements(temp_requirements_path)

        # Download dataset
        dataset_path = data.get('datasetPath')
        temp_dataset_path = download_file(supabase, 'datasets', dataset_path)
        temp_paths.append(temp_dataset_path)

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

            # Extract parameters
            parameters = data.get('parameters', {})
            logger.info(f"Received parameters: {parameters}")

            # Introspect the solve function
            if not hasattr(solver_module, 'solve'):
                raise AttributeError("The solver module does not have a 'solve' function.")

            solve_func = solver_module.solve
            sig = inspect.signature(solve_func)
            logger.info(f"'solve' function signature: {sig}")

            # Prepare arguments without type conversion
            bound_args = {}
            for name, param in sig.parameters.items():
                if name == 'qubo_matrix':
                    bound_args['qubo_matrix'] = qubo_matrix
                else:
                    if name in parameters:
                        bound_args[name] = parameters[name]
                    elif param.default != inspect.Parameter.empty:
                        bound_args[name] = param.default
                    else:
                        raise ValueError(f"Missing required parameter: {name}")

            # Execute the solve function with bound arguments
            logger.info(f"Executing 'solve' with arguments: {bound_args}")
            result = solve_func(**bound_args)
            logger.info("Solver executed successfully.")

            # Ensure the result is JSON serializable
            return jsonify(result)

        finally:
            # Clean up temporary files
            logger.info("Cleaning up temporary files and virtual environment")
            for temp_path in temp_paths:
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                    logger.info(f"Deleted temporary file '{temp_path}'")
            
            # Clean up virtual environment
            if venv_path and os.path.exists(venv_path):
                import shutil
                shutil.rmtree(venv_path)
                logger.info(f"Deleted virtual environment at '{venv_path}'")

    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)