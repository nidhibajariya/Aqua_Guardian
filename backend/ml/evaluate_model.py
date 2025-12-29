"""
Model Evaluation Script
Evaluates the trained pollution detection model and generates performance metrics.
"""
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np
import json
import os
from datetime import datetime
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns

# Define paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASET_DIR = os.path.join(BASE_DIR, 'data', 'dataset')
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pollution_model.h5')
CLASS_INDICES_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'class_indices.json')
METRICS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'model_metrics.json')

# Parameters
IMG_SIZE = (224, 224)
BATCH_SIZE = 32

def evaluate_model():
    """Evaluate the model and generate comprehensive metrics."""
    
    print("=" * 60)
    print("AQUA GUARDIAN - MODEL EVALUATION")
    print("=" * 60)
    
    # Check if model exists
    if not os.path.exists(MODEL_PATH):
        print("❌ Model file not found. Please train the model first.")
        return
    
    # Load model
    print(f"\n📦 Loading model from: {MODEL_PATH}")
    model = load_model(MODEL_PATH)
    print("✅ Model loaded successfully")
    
    # Load class indices
    with open(CLASS_INDICES_PATH, 'r') as f:
        class_indices = json.load(f)
    class_labels = {v: k for k, v in class_indices.items()}
    print(f"\n🏷️  Classes: {list(class_indices.keys())}")
    
    # Prepare test data
    print(f"\n📂 Loading test data from: {DATASET_DIR}")
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
    
    # Evaluate model
    print("\n🔬 Evaluating model...")
    loss, accuracy = model.evaluate(test_generator, verbose=1)
    
    print(f"\n📊 OVERALL METRICS:")
    print(f"   Loss: {loss:.4f}")
    print(f"   Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    
    # Get predictions
    print("\n🎯 Generating predictions...")
    predictions = model.predict(test_generator, verbose=1)
    predicted_classes = np.argmax(predictions, axis=1)
    true_classes = test_generator.classes
    
    # Calculate per-class metrics
    print("\n📈 PER-CLASS PERFORMANCE:")
    report = classification_report(
        true_classes, 
        predicted_classes, 
        target_names=list(class_indices.keys()),
        output_dict=True
    )
    
    for class_name in class_indices.keys():
        metrics = report[class_name]
        print(f"\n   {class_name.upper()}:")
        print(f"      Precision: {metrics['precision']:.4f}")
        print(f"      Recall: {metrics['recall']:.4f}")
        print(f"      F1-Score: {metrics['f1-score']:.4f}")
        print(f"      Support: {int(metrics['support'])} samples")
    
    # Confusion Matrix
    print("\n🔢 Generating confusion matrix...")
    cm = confusion_matrix(true_classes, predicted_classes)
    
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=class_indices.keys(),
                yticklabels=class_indices.keys())
    plt.title('Confusion Matrix - Pollution Detection Model')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    
    cm_path = os.path.join(os.path.dirname(MODEL_PATH), 'confusion_matrix.png')
    plt.savefig(cm_path)
    print(f"✅ Confusion matrix saved to: {cm_path}")
    
    # Calculate confidence statistics
    print("\n📊 CONFIDENCE STATISTICS:")
    max_confidences = np.max(predictions, axis=1)
    print(f"   Mean Confidence: {np.mean(max_confidences):.4f}")
    print(f"   Median Confidence: {np.median(max_confidences):.4f}")
    print(f"   Min Confidence: {np.min(max_confidences):.4f}")
    print(f"   Max Confidence: {np.max(max_confidences):.4f}")
    
    # High confidence predictions
    high_conf_threshold = 0.9
    high_conf_count = np.sum(max_confidences >= high_conf_threshold)
    high_conf_percentage = (high_conf_count / len(max_confidences)) * 100
    print(f"   High Confidence (≥{high_conf_threshold}): {high_conf_count}/{len(max_confidences)} ({high_conf_percentage:.2f}%)")
    
    # Save metrics to JSON
    metrics_data = {
        "model_version": "1.0",
        "evaluation_date": datetime.now().isoformat(),
        "dataset_size": test_generator.samples,
        "overall_metrics": {
            "loss": float(loss),
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
        },
        "confidence_stats": {
            "mean": float(np.mean(max_confidences)),
            "median": float(np.median(max_confidences)),
            "min": float(np.min(max_confidences)),
            "max": float(np.max(max_confidences)),
            "high_confidence_percentage": float(high_conf_percentage)
        },
        "classes": list(class_indices.keys())
    }
    
    with open(METRICS_PATH, 'w') as f:
        json.dump(metrics_data, f, indent=2)
    
    print(f"\n✅ Metrics saved to: {METRICS_PATH}")
    
    # Model summary
    print("\n🏗️  MODEL ARCHITECTURE:")
    model.summary()
    
    print("\n" + "=" * 60)
    print("✅ EVALUATION COMPLETE")
    print("=" * 60)
    
    return metrics_data

if __name__ == "__main__":
    evaluate_model()
