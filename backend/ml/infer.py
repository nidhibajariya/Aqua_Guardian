import os
import io
import numpy as np
from PIL import Image
try:
    from middleware.logging import logger
except ImportError:
    import logging
    logger = logging.getLogger(__name__)

try:
    import tensorflow as tf
    from tensorflow.keras.applications import mobilenet_v2
    from tensorflow.keras.preprocessing import image
    
    # Lazy loading to prevent blocking server startup
    shared_model = None
    
    def get_shared_model():
        global shared_model
        try:
            if shared_model is None:
                logger.info("Loading MobileNetV2 for Hybrid Inference...")
                shared_model = mobilenet_v2.MobileNetV2(weights='imagenet')
            return shared_model
        except Exception as e:
            logger.error(f"Failed to load MobileNetV2: {e}")
            return None
        
    ML_AVAILABLE = True
except Exception as e:
    logger.error(f"ML dependencies (TensorFlow) not available: {e}")
    ML_AVAILABLE = False

def get_color_diagnostics(img):
    """Simple heuristic to detect pollution colors (brown/green/dark)."""
    img_small = img.resize((32, 32))
    pixels = np.array(img_small)
    avg_color = np.mean(pixels, axis=(0, 1))
    
    # R, G, B
    r, g, b = avg_color[0], avg_color[1], avg_color[2]
    
    # Detect dark/murky water (Sewage/Oil)
    is_murky = (r < 100 and g < 100 and b < 100)
    # Detect brownish/greenish tint
    is_tinted = (g > b + 10) or (r > b + 10)
    
    return 0.4 if is_murky or is_tinted else 0.0

def predict_image(image_bytes, demo_mode=True, description=""):
    """
    Hybrid Inference: Combines pre-trained MobileNetV2 with color heuristics.
    """
    if not ML_AVAILABLE:
        return {"class": "unknown", "confidence": 0.0}

    try:
        # Load image
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode != 'RGB':
            img = img.convert('RGB')
            
        # 1. Color Heuristics
        color_bonus = get_color_diagnostics(img)
        
        # 2. ML Object Recognition (MobileNetV2)
        model = get_shared_model()
        
        # FALLBACK: If model failed to load, return basic prediction
        if model is None:
            logger.warning("ML Model not available, using fallback heuristics")
            return {
                "class": "plastic" if color_bonus > 0 else "unknown",
                "confidence": 0.6 if color_bonus > 0 else 0.0
            }

        img_prep = img.resize((224, 224))
        x = image.img_to_array(img_prep)
        x = np.expand_dims(x, axis=0)
        x = mobilenet_v2.preprocess_input(x)
        
        preds = model.predict(x)
        decoded = mobilenet_v2.decode_predictions(preds, top=5)[0]
        
        # Mapping ImageNet to Project Classes (Extensive)
        pollution_map = {
            "water_bottle": ("plastic", 0.95),
            "plastic_bag": ("plastic", 0.92),
            "bottle": ("plastic", 0.85),
            "packet": ("plastic", 0.80),
            "container": ("plastic", 0.75),
            "can": ("plastic", 0.70), # Aluminum/Plastic cans
            "bucket": ("plastic", 0.65),
            "barrel": ("oil_spill", 0.85),
            "drum": ("oil_spill", 0.85),
            "oil_filter": ("oil_spill", 0.90),
            "lighter": ("plastic", 0.60),
            "seashore": ("water", 0.10),
            "promontory": ("water", 0.10),
            "lakeside": ("water", 0.10),
            "sandbar": ("water", 0.10),
        }
        
        top_name = decoded[0][1]
        top_conf = float(decoded[0][2])
        
        final_class = "unknown"
        final_conf = 0.0
        
        # Check top 5 for pollution matches
        for _, label, score in decoded:
            if label in pollution_map:
                final_class, base_conf = pollution_map[label]
                final_conf = max(final_conf, score * base_conf)
        
        # Blend with color heuristics if it's "oil" or "sewage" like
        if final_class == "unknown" and color_bonus > 0:
            final_class = "sewage"
            final_conf = color_bonus + (top_conf * 0.2)
        
        # Adjust for description keywords (Smart Override)
        desc_lower = description.lower() if description else ""
        if "plastic" in desc_lower and final_class != "plastic":
            final_conf += 0.2
        if "oil" in desc_lower or "spill" in desc_lower:
            final_conf += 0.2

        return {
            "class": final_class if final_conf > 0.1 else "unknown",
            "confidence": min(0.99, final_conf)
        }
        
    except Exception as e:
        logger.error(f"Hybrid Inference error: {e}", exc_info=True)
        # Fallback instead of crash
        return {"class": "unknown", "confidence": 0.0}
