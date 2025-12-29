import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from pathlib import Path
import json
import time
from datetime import datetime
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, classification_report
import numpy as np

# ============================================================================
# HYPERPARAMETERS
# ============================================================================
EPOCHS = 50
BATCH_SIZE = 32
LEARNING_RATE = 0.001
NUM_CLASSES = 4  # Updated: removed foam class
IMAGE_SIZE = 224
NUM_WORKERS = 2
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
CHECKPOINT_DIR = Path(__file__).parent / 'checkpoints'
DATASET_DIR = Path(__file__).parent / 'dataset'

# Class names (4 classes: removed foam)
CLASS_NAMES = ['clean', 'oil spill', 'plastic', 'sewage']

# ============================================================================
# DATA AUGMENTATION
# ============================================================================
train_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.RandomAffine(degrees=0, translate=(0.1, 0.1)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

val_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# ============================================================================
# MODEL DEFINITION
# ============================================================================
def get_model(num_classes=NUM_CLASSES, pretrained=True):
    """Load EfficientNet-B0 with custom classifier."""
    model = models.efficientnet_b0(pretrained=pretrained)
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, num_classes)
    return model

# ============================================================================
# TRAINING FUNCTIONS
# ============================================================================
def train_epoch(model, dataloader, criterion, optimizer, device):
    """Train for one epoch."""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    for inputs, labels in dataloader:
        inputs, labels = inputs.to(device), labels.to(device)
        
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item() * inputs.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()
    
    epoch_loss = running_loss / total
    epoch_acc = 100. * correct / total
    return epoch_loss, epoch_acc

def validate_epoch(model, dataloader, criterion, device):
    """Validate for one epoch."""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for inputs, labels in dataloader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item() * inputs.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
    
    epoch_loss = running_loss / total
    epoch_acc = 100. * correct / total
    return epoch_loss, epoch_acc

# ============================================================================
# MAIN TRAINING LOOP
# ============================================================================
def main():
    print("=" * 80)
    print("AQUA Guardian - AI Model Training")
    print("=" * 80)
    print(f"Device: {DEVICE}")
    print(f"Epochs: {EPOCHS}")
    print(f"Batch Size: {BATCH_SIZE}")
    print(f"Learning Rate: {LEARNING_RATE}")
    print(f"Image Size: {IMAGE_SIZE}x{IMAGE_SIZE}")
    print("=" * 80)
    
    # Create checkpoint directory
    CHECKPOINT_DIR.mkdir(exist_ok=True)
    
    # Load datasets
    print("\n📂 Loading datasets...")
    try:
        train_dataset = datasets.ImageFolder(
            root=DATASET_DIR / 'train',
            transform=train_transform
        )
        val_dataset = datasets.ImageFolder(
            root=DATASET_DIR / 'val',
            transform=val_transform
        )
        test_dataset = datasets.ImageFolder(
            root=DATASET_DIR / 'test',
            transform=val_transform
        )
    except Exception as e:
        print(f"❌ Error loading datasets: {e}")
        print(f"\n📋 Expected structure:")
        print(f"{DATASET_DIR}/")
        print(f"  ├── train/")
        print(f"  │   ├── {CLASS_NAMES[0]}/")
        print(f"  │   ├── {CLASS_NAMES[1]}/")
        print(f"  │   └── ...")
        print(f"  ├── val/")
        print(f"  └── test/")
        return
    
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, 
                            shuffle=True, num_workers=NUM_WORKERS)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, 
                          shuffle=False, num_workers=NUM_WORKERS)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, 
                           shuffle=False, num_workers=NUM_WORKERS)
    
    print(f"✅ Train samples: {len(train_dataset)}")
    print(f"✅ Val samples: {len(val_dataset)}")
    print(f"✅ Test samples: {len(test_dataset)}")
    print(f"✅ Classes: {train_dataset.classes}")
    
    # Initialize model
    print("\n🤖 Initializing model...")
    model = get_model(num_classes=NUM_CLASSES, pretrained=True).to(DEVICE)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', 
                                                     factor=0.5, patience=5, verbose=True)
    
    # Training history
    history = {
        'train_loss': [],
        'train_acc': [],
        'val_loss': [],
        'val_acc': [],
        'learning_rates': []
    }
    
    best_val_acc = 0.0
    best_epoch = 0
    
    print("\n🚀 Starting training...\n")
    start_time = time.time()
    
    # Training loop
    for epoch in range(1, EPOCHS + 1):
        epoch_start = time.time()
        
        # Train
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, DEVICE)
        
        # Validate
        val_loss, val_acc = validate_epoch(model, val_loader, criterion, DEVICE)
        
        # Scheduler step
        scheduler.step(val_loss)
        current_lr = optimizer.param_groups[0]['lr']
        
        # Save history
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)
        history['learning_rates'].append(current_lr)
        
        # Print progress
        epoch_time = time.time() - epoch_start
        print(f"Epoch [{epoch:3d}/{EPOCHS}] | "
              f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:6.2f}% | "
              f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc:6.2f}% | "
              f"LR: {current_lr:.6f} | Time: {epoch_time:.1f}s")
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_epoch = epoch
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'val_acc': val_acc,
                'val_loss': val_loss,
            }, CHECKPOINT_DIR / 'model_best.pth')
            print(f"  ✅ New best model saved! Val Acc: {val_acc:.2f}%")
        
        # Save checkpoint every 10 epochs
        if epoch % 10 == 0:
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
            }, CHECKPOINT_DIR / f'checkpoint_epoch_{epoch}.pth')
    
    total_time = time.time() - start_time
    print(f"\n✅ Training completed in {total_time/60:.1f} minutes")
    print(f"🏆 Best Val Accuracy: {best_val_acc:.2f}% (Epoch {best_epoch})")
    
    # Save training history
    history_file = CHECKPOINT_DIR / 'training_history.json'
    with open(history_file, 'w') as f:
        json.dump(history, f, indent=2)
    print(f"📊 Training history saved to: {history_file}")
    
    # Plot training curves
    plot_training_curves(history)
    
    # Evaluate on test set
    print("\n📊 Evaluating on test set...")
    model.load_state_dict(torch.load(CHECKPOINT_DIR / 'model_best.pth')['model_state_dict'])
    test_loss, test_acc = validate_epoch(model, test_loader, criterion, DEVICE)
    print(f"Test Loss: {test_loss:.4f} | Test Acc: {test_acc:.2f}%")
    
    # Generate confusion matrix
    generate_confusion_matrix(model, test_loader, DEVICE)
    
    # Copy best model to main directory
    import shutil
    shutil.copy(CHECKPOINT_DIR / 'model_best.pth', Path(__file__).parent / 'model.pth')
    print(f"\n✅ Best model copied to: backend/ml/model.pth")
    print("\n🎉 Training pipeline complete!\n")

def plot_training_curves(history):
    """Plot and save training curves."""
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    # Loss
    axes[0].plot(history['train_loss'], label='Train Loss', linewidth=2)
    axes[0].plot(history['val_loss'], label='Val Loss', linewidth=2)
    axes[0].set_xlabel('Epoch')
    axes[0].set_ylabel('Loss')
    axes[0].set_title('Training and Validation Loss')
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)
    
    # Accuracy
    axes[1].plot(history['train_acc'], label='Train Acc', linewidth=2)
    axes[1].plot(history['val_acc'], label='Val Acc', linewidth=2)
    axes[1].set_xlabel('Epoch')
    axes[1].set_ylabel('Accuracy (%)')
    axes[1].set_title('Training and Validation Accuracy')
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plot_path = CHECKPOINT_DIR / 'training_curves.png'
    plt.savefig(plot_path, dpi=300, bbox_inches='tight')
    print(f"📈 Training curves saved to: {plot_path}")
    plt.close()

def generate_confusion_matrix(model, dataloader, device):
    """Generate and save confusion matrix."""
    model.eval()
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for inputs, labels in dataloader:
            inputs = inputs.to(device)
            outputs = model(inputs)
            _, predicted = outputs.max(1)
            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.numpy())
    
    # Confusion matrix
    cm = confusion_matrix(all_labels, all_preds)
    
    # Plot
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=CLASS_NAMES, yticklabels=CLASS_NAMES)
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.title('Confusion Matrix - Test Set')
    plt.tight_layout()
    cm_path = CHECKPOINT_DIR / 'confusion_matrix.png'
    plt.savefig(cm_path, dpi=300, bbox_inches='tight')
    print(f"📊 Confusion matrix saved to: {cm_path}")
    plt.close()
    
    # Classification report
    report = classification_report(all_labels, all_preds, 
                                  target_names=CLASS_NAMES, digits=3)
    print("\n" + "=" * 80)
    print("CLASSIFICATION REPORT")
    print("=" * 80)
    print(report)
    
    # Save report
    report_path = CHECKPOINT_DIR / 'classification_report.txt'
    with open(report_path, 'w') as f:
        f.write(report)
    print(f"📄 Classification report saved to: {report_path}")

if __name__ == "__main__":
    main()
