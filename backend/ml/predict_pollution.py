import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import json
import os

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'pollution_model.h5')
CLASS_INDICES_PATH = os.path.join(BASE_DIR, 'class_indices.json')

class PollutionPredictor:
    def __init__(self):
        self.model = None
        self.class_indices = None
        self.load_resources()

    def load_resources(self):
        if os.path.exists(MODEL_PATH):
            print("Loading model...")
            self.model = load_model(MODEL_PATH)
        else:
            print("Model file not found. Please train the model first.")
        
        if os.path.exists(CLASS_INDICES_PATH):
            with open(CLASS_INDICES_PATH, 'r') as f:
                self.class_indices = json.load(f)
                # Invert mapping to get index -> class_name
                self.class_labels = {v: k for k, v in self.class_indices.items()}
        else:
            print("Class indices file not found.")

    def predict(self, img_path):
        if not self.model or not self.class_indices:
            return None, "Model not loaded"

        try:
            # Load and preprocess image
            img = image.load_img(img_path, target_size=(224, 224))
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array /= 255.0  # Normalize

            # Predict
            predictions = self.model.predict(img_array)
            predicted_class_index = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class_index])
            
            predicted_class_name = self.class_labels[predicted_class_index]

            return {
                "class": predicted_class_name,
                "confidence": confidence,
                "all_probabilities": {self.class_labels[i]: float(prob) for i, prob in enumerate(predictions[0])}
            }, None

        except Exception as e:
            return None, str(e)

if __name__ == "__main__":
    # Test usage
    predictor = PollutionPredictor()
    # Replace with a valid image path to test
    # result, error = predictor.predict("path/to/test/image.jpg")
    # print(result)
