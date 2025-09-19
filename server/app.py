# server/app.py
import os, io, base64
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from PIL import Image
from io import BytesIO
from inference_sdk import InferenceHTTPClient


API_KEY = "IDoWHslezkRfXGFx5hTw"
MODEL_ID = "food-ingredients-detection-6ce7j"
MODEL_VERSION = "1"

CLIENT = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="IDoWHslezkRfXGFx5hTw"
)

app = Flask(__name__)
CORS(app)

@app.get("/health")
def health():
    return {"ok": True, "model_id": MODEL_ID, "model_version": MODEL_VERSION}

@app.post("/api/identify-ingredients")
def identify_ingredients():
    print("API endpoint called: /api/identify-ingredients")
    print(request.json)
    if "image" not in request.json:
        return jsonify({"error": "no image"}), 400

    # Get base64 image from request
    image_data = request.json["image"]
    print("Image data received")
    
    # Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    if ',' in image_data:
        image_data = image_data.split(',')[1]
    
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        
        # Save image temporarily for Roboflow API
        temp_path = "temp_image.jpg"
        with open(temp_path, "wb") as f:
            f.write(image_bytes)
        
        print(f"Sending image to Roboflow API using InferenceHTTPClient")
        
        # Use the InferenceHTTPClient to send the image directly
        result = CLIENT.infer(temp_path, model_id="food-ingredients-detection-6ce7j/1")
        
        # Process the predictions
        print("Roboflow API response:", result)
        
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        # Extract ingredients from predictions
        ingredients = []
        if "predictions" in result:
            for pred in result["predictions"]:
                class_name = pred.get("class", "")
                if class_name and class_name not in ingredients:
                    ingredients.append(class_name)
        
        print("Detected ingredients:", ingredients)
        return jsonify({
            "success": True,
            "ingredients": ingredients,
            "predictions": result.get("predictions", [])
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
