import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import json
import os
import io
from PIL import Image

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'pollution_model.h5')
CLASS_INDICES_PATH = os.path.join(BASE_DIR, 'class_indices.json')

class PollutionPredictor:
    def __init__(self):
        self.model = None
        self.class_indices = None
        self.class_labels = None
        self.load_resources()

    def load_resources(self):
        if os.path.exists(MODEL_PATH):
            print(f"Loading model from {MODEL_PATH}...")
            try:
                self.model = load_model(MODEL_PATH)
                print("Model loaded successfully.")
            except Exception as e:
                print(f"Error loading model: {e}")
        else:
            print("Model file not found. Please train the model first.")
        
        if os.path.exists(CLASS_INDICES_PATH):
            try:
                with open(CLASS_INDICES_PATH, 'r') as f:
                    self.class_indices = json.load(f)
                    # Invert mapping to get index -> class_name
                    self.class_labels = {v: k for k, v in self.class_indices.items()}
                print(f"Class indices loaded: {self.class_indices}")
            except Exception as e:
                print(f"Error loading class indices: {e}")
        else:
            print("Class indices file not found.")

    def preprocess_image(self, img):
        if img.mode != 'RGB':
            img = img.convert('RGB')
        img = img.resize((224, 224))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array /= 255.0  # Normalize
        return img_array

    def predict(self, img_path):
        if not self.model or not self.class_labels:
            return None, "Model or class indices not loaded"

        try:
            # Load and preprocess image
            img = image.load_img(img_path, target_size=(224, 224))
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array /= 255.0  # Normalize

            return self._predict_internal(img_array)

        except Exception as e:
            return None, str(e)

    def predict_bytes(self, img_bytes):
        if not self.model or not self.class_labels:
            return None, "Model or class indices not loaded"

        try:
            img = Image.open(io.BytesIO(img_bytes))
            img_array = self.preprocess_image(img)
            return self._predict_internal(img_array)
        except Exception as e:
            return None, str(e)

    def _predict_internal(self, img_array):
        # Predict
        predictions = self.model.predict(img_array)
        predicted_class_index = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_index])
        
        predicted_class_name = self.class_labels.get(predicted_class_index, "unknown")

        return {
            "class": predicted_class_name,
            "confidence": confidence,
            "all_probabilities": {self.class_labels[i]: float(prob) for i, prob in enumerate(predictions[0])}
        }, None

if __name__ == "__main__":
    # Test usage
    predictor = PollutionPredictor()
    # Replace with a valid image path to test
    # result, error = predictor.predict("path/to/test/image.jpg")
    # print(result)
