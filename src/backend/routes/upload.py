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
        contents = await file.read()  # Read the file as binary
        # Use numpy's frombuffer or a temporary file to handle the binary data
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(contents)
            temp_file_path = temp_file.name

        QUBO_matrix = np.load(temp_file_path)
    except Exception as e:
        return JSONResponse(content={"error": f"Failed to process file: {str(e)}"}, status_code=500)

    # Run the optimization
    try:
        result = quantum_opt(
            QUBO_m=QUBO_matrix,
            c=0,  # Placeholder for constant
            num_layers=num_layers,
            max_iters=max_iters,
            nbitstrings=nbitstrings,
            opt_time=opt_time,
            rl_time=rl_time,
            initial_temperature=initial_temperature
        )
    except Exception as e:
        return JSONResponse(content={"error": f"Optimization failed: {str(e)}"}, status_code=500)

    return {
        "description": description,
        "result": result
    }

