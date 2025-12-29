"""
Enhanced Training Script for 90%+ Accuracy
Includes: Class Weights, Early Stopping, LR Scheduling, Fine-tuning, Enhanced Augmentation
"""
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from sklearn.utils.class_weight import compute_class_weight
import numpy as np
import os
import json
import matplotlib.pyplot as plt

# Define paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASET_DIR = os.path.join(BASE_DIR, 'data', 'dataset')
MODEL_SAVE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pollution_model.h5')
CLASS_INDICES_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'class_indices.json')
BEST_MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'best_pollution_model.h5')

# Enhanced Parameters for 90%+ Accuracy
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 30
INITIAL_LEARNING_RATE = 0.001
FINE_TUNE_LEARNING_RATE = 0.0001

def train_model():
    print("=" * 60)
    print("ENHANCED TRAINING FOR 90%+ ACCURACY")
    print("=" * 60)
    print(f"Loading data from: {DATASET_DIR}")
    
    # Enhanced Data Augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=40,
        width_shift_range=0.3,
        height_shift_range=0.3,
        shear_range=0.3,
        zoom_range=0.3,
        horizontal_flip=True,
        vertical_flip=True,
        brightness_range=[0.7, 1.3],
        fill_mode='nearest',
        validation_split=0.2
    )

    val_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2
    )

    train_generator = train_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        shuffle=True
    )

    validation_generator = val_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        shuffle=False
    )

    class_indices = train_generator.class_indices
    print(f"Classes found: {class_indices}")
    with open(CLASS_INDICES_PATH, 'w') as f:
        json.dump(class_indices, f)

    # Calculate Class Weights
    print("Calculating class weights...")
    class_weights = compute_class_weight(
        'balanced',
        classes=np.unique(train_generator.classes),
        y=train_generator.classes
    )
    class_weight_dict = dict(enumerate(class_weights))
    print(f"Class weights: {class_weight_dict}")

    # Build Model
    print("Building model...")
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    base_model.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.5)(x)
    x = BatchNormalization()(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.3)(x)
    predictions = Dense(len(class_indices), activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=predictions)

    model.compile(
        optimizer=Adam(learning_rate=INITIAL_LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    # Setup Callbacks
    early_stop = EarlyStopping(
        monitor='val_loss',
        patience=7,
        restore_best_weights=True,
        verbose=1
    )

    reduce_lr = ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=3,
        min_lr=1e-7,
        verbose=1
    )

    checkpoint = ModelCheckpoint(
        BEST_MODEL_PATH,
        monitor='val_accuracy',
        save_best_only=True,
        mode='max',
        verbose=1
    )

    # Phase 1: Train with frozen base
    print("PHASE 1: Training with frozen base model")
    history_phase1 = model.fit(
        train_generator,
        steps_per_epoch=train_generator.samples // BATCH_SIZE,
        validation_data=validation_generator,
        validation_steps=validation_generator.samples // BATCH_SIZE,
        epochs=15,
        class_weight=class_weight_dict,
        callbacks=[early_stop, reduce_lr, checkpoint],
        verbose=1
    )

    # Phase 2: Fine-tune
    print("PHASE 2: Fine-tuning top layers")
    base_model.trainable = True
    
    for layer in base_model.layers[:100]:
        layer.trainable = False

    model.compile(
        optimizer=Adam(learning_rate=FINE_TUNE_LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    history_phase2 = model.fit(
        train_generator,
        steps_per_epoch=train_generator.samples // BATCH_SIZE,
        validation_data=validation_generator,
        validation_steps=validation_generator.samples // BATCH_SIZE,
        epochs=EPOCHS,
        initial_epoch=15,
        class_weight=class_weight_dict,
        callbacks=[early_stop, reduce_lr, checkpoint],
        verbose=1
    )

    model.save(MODEL_SAVE_PATH)
    print(f"Final model saved to {MODEL_SAVE_PATH}")
    print(f"Best model saved to {BEST_MODEL_PATH}")

    # Plot Results
    history = {
        'accuracy': history_phase1.history['accuracy'] + history_phase2.history['accuracy'],
        'val_accuracy': history_phase1.history['val_accuracy'] + history_phase2.history['val_accuracy'],
        'loss': history_phase1.history['loss'] + history_phase2.history['loss'],
        'val_loss': history_phase1.history['val_loss'] + history_phase2.history['val_loss']
    }

    acc = history['accuracy']
    val_acc = history['val_accuracy']
    
    print("TRAINING COMPLETE!")
    print(f"Final Validation Accuracy: {val_acc[-1]:.4f} ({val_acc[-1]*100:.2f}%)")

if __name__ == "__main__":
    train_model()
