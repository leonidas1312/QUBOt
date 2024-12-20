from fastapi import FastAPI
from routes.upload import router as upload_router

app = FastAPI()

# Include the upload route
app.include_router(upload_router)

# Test if the server runs
@app.get("/")
def read_root():
    return {"message": "FastAPI Server Running"}
