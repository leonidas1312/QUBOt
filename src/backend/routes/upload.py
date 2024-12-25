# routes/upload.py
from fastapi import APIRouter, File, UploadFile, Form, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
import numpy as np
import torch
import uuid
from tasks import run_quantum_opt_task  # Import the Celery task
import redis
import json

router = APIRouter()

# Initialize Redis client for Pub/Sub
redis_client = redis.Redis(host='redis', port=6379, db=0)

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

@router.websocket("/ws/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str):
    await websocket.accept()
    pubsub = redis_client.pubsub()
    pubsub.subscribe(task_id)
    try:
        for message in pubsub.listen():
            if message['type'] == 'message':
                data = message['data'].decode('utf-8')
                await websocket.send_text(data)
                # If final message, close the connection
                message_json = json.loads(data)
                if 'final' in message_json and message_json['final']:
                    break
    except WebSocketDisconnect:
        pass
    finally:
        pubsub.unsubscribe(task_id)
        pubsub.close()

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

    # Generate a unique task ID
    task_id = str(uuid.uuid4())

    try:
        contents = await file.read()
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(contents)
            temp_file_path = temp_file.name

        QUBO_matrix = np.load(temp_file_path)
    except Exception as e:
        return JSONResponse(content={"error": f"Failed to process file: {str(e)}"}, status_code=500)

    # Prepare parameters
    parameters = {
        'num_layers': num_layers,
        'max_iters': max_iters,
        'nbitstrings': nbitstrings,
        'opt_time': opt_time,
        'rl_time': rl_time,
        'initial_temperature': initial_temperature
    }

    # Convert QUBO_matrix to list for JSON serializability
    QUBO_matrix_list = QUBO_matrix.tolist()

    # Start the Celery task
    run_quantum_opt_task.delay(task_id, QUBO_matrix_list, parameters, description)

    # Return the task ID to the client
    return {"task_id": task_id}
