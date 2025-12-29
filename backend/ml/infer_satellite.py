import torch
import numpy as np
import os
from .satellite_model import get_satellite_model
from .satellite_processing import Sentinel2Processor

# Classes must match training data
CLASSES = ["Clean Water", "Oil Spill", "Algae", "Sediment"]

def load_satellite_model(model_path="satellite_model.pth"):
    model = get_satellite_model(num_classes=len(CLASSES))
    try:
        model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
        model.eval()
    except FileNotFoundError:
        print("Satellite model not found, using random weights.")
    return model

def analyze_location(safe_path, lat, lon):
    """
    Analyzes a specific location in the Sentinel-2 scene.
    """
    # 1. Process Image
    processor = Sentinel2Processor(safe_path)
    processor.read_bands()
    
    # 2. Crop Patch (256x256)
    # Note: crop_image currently uses pixel coordinates (center crop). 
    # In a real app, you'd convert lat/lon to pixels here.
    # For now, we just take the center crop as a placeholder for the location.
    cropped_bands = processor.crop_image(lat, lon, size_pixels=256)
    
    # 3. Create Composite
    composite = processor.create_composite(cropped_bands) # (6, 256, 256)
    
    # 4. Inference
    model = load_satellite_model()
    
    input_tensor = torch.from_numpy(composite).unsqueeze(0) # Add batch dim
    
    with torch.no_grad():
        output = model(input_tensor)
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        
    confidence, predicted_idx = torch.max(probabilities, 0)
    predicted_class = CLASSES[predicted_idx.item()]
    
    # 5. Calculate Indices for additional context
    indices = processor.calculate_indices(cropped_bands)
    avg_ndwi = np.mean(indices['NDWI'])
    avg_turbidity = np.mean(indices['Turbidity'])
    
    return {
        "class": predicted_class,
        "confidence": float(confidence.item()),
        "indices": {
            "ndwi": float(avg_ndwi),
            "turbidity": float(avg_turbidity)
        }
    }
