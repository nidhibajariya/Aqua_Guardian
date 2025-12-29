import torch
import torchvision.models as models
import torch.nn as nn

def get_model(num_classes=5):
    # Load EfficientNet-B0
    model = models.efficientnet_b0(pretrained=True)
    
    # Replace the classifier head
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, num_classes)
    
    return model

def load_model(path="model.pth"):
    model = get_model()
    try:
        model.load_state_dict(torch.load(path, map_location=torch.device('cpu')))
        model.eval()
    except FileNotFoundError:
        print("Model file not found, using initialized weights (random predictions)")
    return model
