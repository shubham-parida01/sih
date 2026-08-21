import os
import sys

# Ensure we can import onnxruntime
try:
    import onnxruntime as ort
    print("onnxruntime is installed!")
except ImportError:
    print("onnxruntime is NOT installed. Installing it or checking virtual env...")
    sys.exit(1)

model_path = os.path.join(os.path.dirname(__file__), "models", "student_model.onnx")
if not os.path.exists(model_path):
    print(f"Model file not found at: {model_path}")
    sys.exit(1)

print(f"Loading model from: {model_path}...")
try:
    session = ort.InferenceSession(model_path)
    print("Model loaded successfully!")
    
    print("\n--- Model Inputs ---")
    for input_meta in session.get_inputs():
        print(f"Name: {input_meta.name}")
        print(f"Type: {input_meta.type}")
        print(f"Shape: {input_meta.shape}")
        
    print("\n--- Model Outputs ---")
    for output_meta in session.get_outputs():
        print(f"Name: {output_meta.name}")
        print(f"Type: {output_meta.type}")
        print(f"Shape: {output_meta.shape}")
except Exception as e:
    print(f"Error loading or inspecting model: {e}")
