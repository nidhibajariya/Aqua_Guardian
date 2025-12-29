import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
import os
import glob
from .satellite_model import get_satellite_model

class SatelliteDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.classes = sorted(os.listdir(root_dir))
        self.class_to_idx = {cls_name: i for i, cls_name in enumerate(self.classes)}
        self.samples = []
        
        for cls_name in self.classes:
            cls_dir = os.path.join(root_dir, cls_name)
            if not os.path.isdir(cls_dir):
                continue
            for file_path in glob.glob(os.path.join(cls_dir, "*.npy")):
                self.samples.append((file_path, self.class_to_idx[cls_name]))
                
    def __len__(self):
        return len(self.samples)
    
    def __getitem__(self, idx):
        path, label = self.samples[idx]
        # Load numpy array (6, 256, 256)
        image = np.load(path).astype(np.float32)
        
        # Convert to tensor
        image_tensor = torch.from_numpy(image)
        
        if self.transform:
            image_tensor = self.transform(image_tensor)
            
        return image_tensor, label

def train_satellite_model(data_dir, num_epochs=20, batch_size=16, learning_rate=0.001):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # Datasets
    train_dir = os.path.join(data_dir, 'train')
    val_dir = os.path.join(data_dir, 'val')
    
    if not os.path.exists(train_dir):
        print(f"Train directory not found: {train_dir}")
        return

    train_dataset = SatelliteDataset(train_dir)
    val_dataset = SatelliteDataset(val_dir) if os.path.exists(val_dir) else None
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False) if val_dataset else None
    
    print(f"Classes: {train_dataset.classes}")
    
    # Model
    model = get_satellite_model(num_classes=len(train_dataset.classes))
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    
    for epoch in range(num_epochs):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            
        epoch_acc = 100 * correct / total
        print(f"Epoch {epoch+1}/{num_epochs}, Loss: {running_loss/len(train_loader):.4f}, Acc: {epoch_acc:.2f}%")
        
        if val_loader:
            model.eval()
            val_correct = 0
            val_total = 0
            with torch.no_grad():
                for inputs, labels in val_loader:
                    inputs, labels = inputs.to(device), labels.to(device)
                    outputs = model(inputs)
                    _, predicted = torch.max(outputs.data, 1)
                    val_total += labels.size(0)
                    val_correct += (predicted == labels).sum().item()
            print(f"Val Acc: {100 * val_correct / val_total:.2f}%")
            
    # Save model
    torch.save(model.state_dict(), "satellite_model.pth")
    print("Model saved to satellite_model.pth")

if __name__ == "__main__":
    # Expects data/satellite/train and data/satellite/val
    train_satellite_model("data/satellite")
