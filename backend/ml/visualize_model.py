import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.utils import plot_model
import os
import sys

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'pollution_model.h5')
SUMMARY_PATH = os.path.join(BASE_DIR, 'model_summary.txt')
ARCHITECTURE_PATH = os.path.join(BASE_DIR, 'model_architecture.png')

def visualize():
    if not os.path.exists(MODEL_PATH):
        print(f"Error: Model file not found at {MODEL_PATH}")
        return

    try:
        print(f"Loading model from {MODEL_PATH}...")
        model = load_model(MODEL_PATH)
        print("Model loaded successfully.")

        # Generate Summary
        print(f"Generating model summary to {SUMMARY_PATH}...")
        with open(SUMMARY_PATH, 'w') as f:
            # Redirect stdout to file to capture summary
            original_stdout = sys.stdout
            sys.stdout = f
            model.summary()
            sys.stdout = original_stdout
        print("Model summary generated.")

        # Generate Architecture Diagram
        print(f"Generating model architecture diagram to {ARCHITECTURE_PATH}...")
        try:
            plot_model(model, to_file=ARCHITECTURE_PATH, show_shapes=True, show_layer_names=True)
            print("Model architecture diagram generated.")
        except ImportError as e:
            print(f"Error generating architecture diagram: {e}")
            print("Ensure graphviz is installed and in your PATH.")
            print("You can install it via: conda install graphviz or pip install pydot graphviz")
            # Also need system graphviz installed
        except Exception as e:
            print(f"An error occurred while plotting model: {e}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    visualize()
