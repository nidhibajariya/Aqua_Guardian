from fastapi import APIRouter, UploadFile, File, HTTPException
from ml.infer import predict_image
from ml.satellite import process_satellite_image

router = APIRouter()

@router.post("/image")
async def analyze_image(file: UploadFile = File(...)):
    file_bytes = await file.read()
    result = predict_image(file_bytes)
    return result

@router.post("/satellite")
def analyze_satellite():
    # In a real scenario, this might accept coordinates or a date range
    result = process_satellite_image(None)
    return result
