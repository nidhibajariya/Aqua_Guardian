import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from predict import PollutionPredictor

# Test the predictor
predictor = PollutionPredictor()

# Test with a plastic image
DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "dataset")
plastic_img_dir = os.path.join(DATA_PATH, "plastic")
plastic_files = [f for f in os.listdir(plastic_img_dir) if f.endswith('.jpg')]
if plastic_files:
    plastic_img = os.path.join(plastic_img_dir, plastic_files[0])
    print(f"\n=== Testing with Plastic Image: {plastic_files[0]} ===")
    result, error = predictor.predict(plastic_img)
    if error:
        print(f"Error: {error}")
    else:
        print(f"Predicted Class: {result['class']}")
        print(f"Confidence: {result['confidence']:.2%}")
        print(f"All Probabilities:")
        for cls, prob in result['all_probabilities'].items():
            print(f"  {cls}: {prob:.2%}")

# Test with a clean image
clean_img = os.path.join(DATA_PATH, "clean")
clean_files = [f for f in os.listdir(clean_img) if f.endswith('.jpg')]
if clean_files:
    clean_img_path = os.path.join(clean_img, clean_files[0])
    print(f"\n=== Testing with Clean Image: {clean_files[0]} ===")
    result, error = predictor.predict(clean_img_path)
    if error:
        print(f"Error: {error}")
    else:
        print(f"Predicted Class: {result['class']}")
        print(f"Confidence: {result['confidence']:.2%}")
        print(f"All Probabilities:")
        for cls, prob in result['all_probabilities'].items():
            print(f"  {cls}: {prob:.2%}")

# Test with oil spill image
oil_img = os.path.join(DATA_PATH, "oil_spill")
oil_files = [f for f in os.listdir(oil_img) if f.endswith('.jpg')]
if oil_files:
    oil_img_path = os.path.join(oil_img, oil_files[0])
    print(f"\n=== Testing with Oil Spill Image: {oil_files[0]} ===")
    result, error = predictor.predict(oil_img_path)
    if error:
        print(f"Error: {error}")
    else:
        print(f"Predicted Class: {result['class']}")
        print(f"Confidence: {result['confidence']:.2%}")
        print(f"All Probabilities:")
        for cls, prob in result['all_probabilities'].items():
            print(f"  {cls}: {prob:.2%}")

# Test with sewage image
sewage_img = os.path.join(DATA_PATH, "sewage")
sewage_files = [f for f in os.listdir(sewage_img) if f.endswith('.jpg')]
if sewage_files:
    sewage_img_path = os.path.join(sewage_img, sewage_files[0])
    print(f"\n=== Testing with Sewage Image: {sewage_files[0]} ===")
    result, error = predictor.predict(sewage_img_path)
    if error:
        print(f"Error: {error}")
    else:
        print(f"Predicted Class: {result['class']}")
        print(f"Confidence: {result['confidence']:.2%}")
        print(f"All Probabilities:")
        for cls, prob in result['all_probabilities'].items():
            print(f"  {cls}: {prob:.2%}")
