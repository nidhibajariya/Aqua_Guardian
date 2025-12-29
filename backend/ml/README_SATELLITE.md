# Aqua Guardian Satellite Pipeline

This module handles the processing of Sentinel-2 satellite imagery for water pollution detection.

## Features
- **Band Reading**: Reads B02, B03, B04, B08 (10m) and B11, B12 (20m, resampled to 10m).
- **Indices**: Calculates NDWI, MNDWI, NDVI, and Turbidity.
- **Deep Learning**: Custom CNN (6-channel input) to classify water patches.
- **Inference**: Analyzes specific locations to verify pollution reports.

## Setup

1.  **Dataset**: Place your Sentinel-2 SAFE folder in a known location.
    Example: `C:\Users\Urvashi\OneDrive\Desktop\AQUA_guardian_project\sential2_dataset\S2C_MSIL2A_...SAFE`

2.  **Requirements**: Ensure `rasterio`, `matplotlib`, `scikit-image` are installed.
    ```bash
    pip install rasterio matplotlib scikit-image
    ```

## Usage

### 1. Data Preparation (Patch Generation)
To train the model, you first need to generate patches from your satellite scenes.
Modify the `main` block in `satellite_processing.py` to point to your SAFE folder and run:
```bash
python -m backend.ml.satellite_processing
```
This will generate `.npy` files in `data/satellite_patches`. You should manually sort these into class folders (e.g., `data/satellite/train/Oil Spill`, `data/satellite/train/Clean Water`).

### 2. Training
Once data is organized:
```bash
python -m backend.ml.train_satellite
```
This saves `satellite_model.pth`.

### 3. Inference
The API uses `satellite.py` which calls `infer_satellite.py`.
You can test it directly:
```python
from backend.ml.infer_satellite import analyze_location
result = analyze_location("path/to/SAFE", lat, lon)
print(result)
```

## File Structure
- `satellite_processing.py`: Core logic for reading SAFE files and processing bands.
- `satellite_model.py`: PyTorch CNN architecture.
- `train_satellite.py`: Training script.
- `infer_satellite.py`: Inference logic.
- `satellite.py`: API entry point.
