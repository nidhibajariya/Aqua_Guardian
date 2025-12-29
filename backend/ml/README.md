# Aqua Guardian ML Module

This module contains the Machine Learning components for the Aqua Guardian project.

## Files

- `model.py`: Defines the CNN architecture (EfficientNet-B0) for image classification.
- `infer.py`: Handles image inference. Loads the model and predicts the class of an input image.
- `train.py`: Script to train the model on a custom dataset.
- `satellite.py`: Mock module for satellite image processing (NDWI/NDTI calculation).

## How to Train the Model

To train the model with your own data (plastic, sewage, oil spill, etc.), follow these steps:

1.  **Prepare Data**:
    Create a `data` directory inside `backend/ml` (or anywhere, but update the path in `train.py`).
    The structure should be:
    ```
    data/
      train/
        plastic/
          img1.jpg
          img2.jpg
          ...
        sewage/
          ...
        oil/
          ...
        foam/
          ...
        other/
          ...
      val/
        plastic/
          ...
        sewage/
          ...
        ...
    ```

2.  **Run Training**:
    Navigate to the `backend` directory and run:
    ```bash
    python -m backend.ml.train
    ```
    (Ensure you are in the parent directory of `backend` so the module import works, or adjust PYTHONPATH).

3.  **Model Saving**:
    The script will save the best model weights to `model.pth` in the current directory.
    Move this `model.pth` to `backend/ml/model.pth` if it's not already there.

## Inference

The `infer.py` script automatically loads `backend/ml/model.pth`. If the file is missing, it uses a model with random weights (for testing purposes).
