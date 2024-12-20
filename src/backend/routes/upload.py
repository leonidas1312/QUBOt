from fastapi import APIRouter, File, UploadFile, Form
from fastapi.responses import JSONResponse
import numpy as np
from utils.QEAO import quantum_opt

router = APIRouter()

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

    # Load QUBO matrix
    try:
        contents = await file.read()
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(contents)
            temp_file_path = temp_file.name

        QUBO_matrix = np.load(temp_file_path)
    except Exception as e:
        return JSONResponse(content={"error": f"Failed to process file: {str(e)}"}, status_code=500)

    # Run the optimization
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

        # Convert numpy arrays to Python lists for JSON serialization
        result = {
            "best_bitstring": best_bitstring.tolist() if isinstance(best_bitstring, np.ndarray) else best_bitstring,
            "best_cost": float(best_cost) if isinstance(best_cost, (np.float32, np.float64)) else best_cost,
            "cost_values": [float(x) for x in cost_values] if isinstance(cost_values, np.ndarray) else cost_values,
            "time_per_iteration": float(time_per_iteration) if isinstance(time_per_iteration, (np.float32, np.float64)) else time_per_iteration,
            "progress_rl_costs": [float(x) for x in progress_rl_costs] if isinstance(progress_rl_costs, np.ndarray) else progress_rl_costs,
            "progress_opt_costs": [float(x) for x in progress_opt_costs] if isinstance(progress_opt_costs, np.ndarray) else progress_opt_costs
        }

    except Exception as e:
        return JSONResponse(content={"error": f"Optimization failed: {str(e)}"}, status_code=500)

    return {
        "description": description,
        "result": result
    }