from fastapi import APIRouter, File, UploadFile, Form
from fastapi.responses import JSONResponse
import numpy as np
import torch
from utils.QEAO import quantum_opt

router = APIRouter()

def convert_numpy_array(arr):
    """Convert numpy arrays and tensors to Python native types"""
    if isinstance(arr, np.ndarray):
        if arr.ndim == 0:  # Handle 0-d arrays
            return arr.item()
        return [convert_numpy_array(x) for x in arr]
    elif isinstance(arr, (np.float32, np.float64, np.int32, np.int64)):
        return float(arr)  # Convert numpy scalars to Python float
    elif isinstance(arr, torch.Tensor):
        # Convert torch tensor to numpy then to Python native type
        return convert_numpy_array(arr.detach().cpu().numpy())
    elif isinstance(arr, (list, tuple)):
        return [convert_numpy_array(x) for x in arr]
    return arr

@router.post("/upload/")
async def upload_qubo_matrix(
        file: UploadFile = File(...),
        description: str = Form(...),
        num_layers: int = Form(...),
        max_iters: int = Form(...),
        nbitstrings: int = Form(...),
        opt_time: float = Form(...),
        rl_time: float = Form(...),
        initial_temperature: float = Form(...),
):
    if not file.filename.endswith(".npy"):
        return JSONResponse(content={"error": "Invalid file format. Please upload a .npy file."}, status_code=400)

    try:
        contents = await file.read()
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(contents)
            temp_file_path = temp_file.name

        QUBO_matrix = np.load(temp_file_path)
    except Exception as e:
        return JSONResponse(content={"error": f"Failed to process file: {str(e)}"}, status_code=500)

    try:
        best_bitstring, best_cost, cost_values, time_per_iteration, progress_rl_costs, progress_opt_costs = quantum_opt(
            QUBO_m=QUBO_matrix,
            c=0,
            num_layers=num_layers,
            max_iters=max_iters,
            nbitstrings=nbitstrings,
            opt_time=opt_time,
            rl_time=rl_time,
            initial_temperature=initial_temperature
        )

        # Convert all numpy arrays and tensors to Python native types
        result = {
            "best_bitstring": convert_numpy_array(best_bitstring),
            "best_cost": convert_numpy_array(best_cost),
            "cost_values": convert_numpy_array(cost_values),
            "time_per_iteration": convert_numpy_array(time_per_iteration),
            "progress_rl_costs": convert_numpy_array(progress_rl_costs),
            "progress_opt_costs": convert_numpy_array(progress_opt_costs)
        }

    except Exception as e:
        return JSONResponse(content={"error": f"Optimization failed: {str(e)}"}, status_code=500)

    return {
        "description": description,
        "result": result
    }