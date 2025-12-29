import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np
import json
import os
from datetime import datetime
from sklearn.metrics import classification_report, confusion_matrix

# Define paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASET_DIR = os.path.join(BASE_DIR, 'data', 'dataset')
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pollution_model.h5')
CLASS_INDICES_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'class_indices.json')
METRICS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'model_metrics.json')

# Parameters - Reduced batch size for memory optimization
IMG_SIZE = (224, 224)
BATCH_SIZE = 8  # Reduced from 32 to 8 to save memory

def evaluate_model_lite():
    print("=" * 60)
    print("AQUA GUARDIAN - LITE MODEL EVALUATION")
    print("=" * 60)
    
    if not os.path.exists(MODEL_PATH):
        print("❌ Model file not found.")
        return

    # Load model
    print(f"📦 Loading model...")
    try:
        # Use CPU to avoid GPU memory issues if any
        with tf.device('/CPU:0'):
            model = load_model(MODEL_PATH)
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return

    # Load class indices
    with open(CLASS_INDICES_PATH, 'r') as f:
        class_indices = json.load(f)
    print(f"🏷️  Classes: {list(class_indices.keys())}")
    
    # Prepare test data generator
    print(f"📂 Loading test data...")
    test_datagen = ImageDataGenerator(rescale=1./255, validation_split=0.2)
    
    test_generator = test_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        shuffle=False
    )
    
    print(f"✅ Found {test_generator.samples} test images")
    
    # Predict in batches
    print("🎯 Generating predictions (Lite Mode)...")
    predictions = []
    true_classes = test_generator.classes
    
    # Manual batch processing to control memory
    steps = int(np.ceil(test_generator.samples / BATCH_SIZE))
    for i in range(steps):
        if i % 10 == 0:
            print(f"   Processing batch {i+1}/{steps}...")
        x, _ = next(test_generator)
        batch_preds = model.predict_on_batch(x)
        predictions.extend(batch_preds)
        
        # Force garbage collection
        import gc
        gc.collect()
        
    predictions = np.array(predictions[:test_generator.samples])
    predicted_classes = np.argmax(predictions, axis=1)
    
    # Calculate metrics
    print("\n📊 Calculating metrics...")
    report = classification_report(
        true_classes, 
        predicted_classes, 
        target_names=list(class_indices.keys()),
        output_dict=True
    )
    
    accuracy = report['accuracy']
    print(f"   Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    
    # Save metrics
    metrics_data = {
        "model_version": "1.0-lite",
        "evaluation_date": datetime.now().isoformat(),
        "dataset_size": test_generator.samples,
        "overall_metrics": {
            "accuracy": float(accuracy)
        },
        "per_class_metrics": {
            class_name: {
                "precision": float(report[class_name]['precision']),
                "recall": float(report[class_name]['recall']),
                "f1_score": float(report[class_name]['f1-score']),
                "support": int(report[class_name]['support'])
            }
            for class_name in class_indices.keys()
        }
    }
    
    with open(METRICS_PATH, 'w') as f:
        json.dump(metrics_data, f, indent=2)
        
    print(f"✅ Metrics saved to: {METRICS_PATH}")

if __name__ == "__main__":
    evaluate_model_lite()
