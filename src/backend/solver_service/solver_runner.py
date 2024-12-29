from flask import Flask, request, jsonify
import numpy as np
import os
import tempfile
from supabase import create_client, Client
import importlib.util
import sys

app = Flask(__name__)

def download_file_in_chunks(supabase: Client, bucket: str, path: str, chunk_size=1024*1024):
    """Download file from Supabase storage in chunks"""
    try:
        response = supabase.storage.from_(bucket).download(path)
        
        # Create a temporary file to store the chunks
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            for chunk in response.iter_content(chunk_size=chunk_size):
                if chunk:
                    temp_file.write(chunk)
            return temp_file.name
    except Exception as e:
        print(f"Error downloading file: {str(e)}")
        raise

@app.route('/solve', methods=['POST'])
def solve():
    try:
        data = request.json
        
        # Initialize Supabase client
        supabase_url = data.get('supabaseUrl')
        supabase_key = data.get('supabaseKey')
        supabase = create_client(supabase_url, supabase_key)
        
        # Download solver code
        solver_path = data.get('solverPath')
        temp_solver_path = download_file_in_chunks(supabase, 'solvers', solver_path)
        
        # Download dataset
        dataset_path = data.get('datasetPath')
        temp_dataset_path = download_file_in_chunks(supabase, 'datasets', dataset_path)
        
        try:
            # Load the QUBO matrix
            qubo_matrix = np.load(temp_dataset_path)
            
            # Dynamically load the solver module
            spec = importlib.util.spec_from_file_location("solver_module", temp_solver_path)
            solver_module = importlib.util.module_from_spec(spec)
            sys.modules["solver_module"] = solver_module
            spec.loader.exec_module(solver_module)
            
            # Execute the solver
            parameters = data.get('parameters', {})
            result = solver_module.solve(qubo_matrix, parameters)
            
            return jsonify(result)
            
        finally:
            # Clean up temporary files
            if os.path.exists(temp_solver_path):
                os.unlink(temp_solver_path)
            if os.path.exists(temp_dataset_path):
                os.unlink(temp_dataset_path)
                
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)