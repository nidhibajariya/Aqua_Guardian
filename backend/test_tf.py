import sys
print(f"Python Version: {sys.version}")
try:
    import tensorflow as tf
    print("TensorFlow imported successfully")
    print(f"TF Version: {tf.__version__}")
except Exception as e:
    print(f"Failed to import TensorFlow: {e}")
