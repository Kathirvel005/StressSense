import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

# Load model upon startup; train if not present
model_data = None
try:
    if not os.path.exists(MODEL_PATH):
        print("Model file not found. Running training script first...")
        from train import train_model
        train_model()
    
    model_data = joblib.load(MODEL_PATH)
    print("Random Forest model successfully loaded.")
except Exception as e:
    print(f"Error loading model: {e}")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "model_loaded": model_data is not None})

@app.route("/metrics", methods=["GET"])
def metrics():
    if model_data is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    model = model_data["model"]
    feature_names = model_data["feature_names"]
    
    # Calculate feature importances
    importances = model.feature_importances_
    feat_importances = {name: float(imp) for name, imp in zip(feature_names, importances)}
    
    return jsonify({
        "accuracy": model_data["metrics"]["accuracy"],
        "feature_importances": feat_importances
    })

@app.route("/predict", methods=["POST"])
def predict():
    if model_data is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON body provided"}), 400
        
        feature_names = model_data["feature_names"]
        model = model_data["model"]
        
        # Build features array checking for missing ones
        missing_features = [f for f in feature_names if f not in data]
        if missing_features:
            return jsonify({"error": f"Missing features: {missing_features}"}), 400
            
        # Extract features in the correct order
        features = [float(data[feat]) for feat in feature_names]
        df_input = pd.DataFrame([features], columns=feature_names)
        
        # Predict class
        prediction = int(model.predict(df_input)[0])
        
        # Predict probabilities
        probabilities = model.predict_proba(df_input)[0]
        confidence = float(probabilities[prediction])
        
        # Map class levels
        stress_levels_map = {0: "Low", 1: "Medium", 2: "High"}
        predicted_label = stress_levels_map.get(prediction, "Unknown")
        
        # Compute local impact: feature value * global importance
        # (A simple proxy for feature contribution in user-friendly terms)
        feature_importance = model.feature_importances_
        contributions = []
        for name, value, imp in zip(feature_names, features, feature_importance):
            # Scale value by its relative range to estimate contribution
            # e.g., anxiety_level is 0-21, sleep_quality is 0-5, etc.
            max_val = 30.0 if name == "self_esteem" else (21.0 if name == "anxiety_level" else (27.0 if name == "depression" else 5.0))
            if name == "blood_pressure":
                max_val = 3.0
            
            # Normalize user value between 0 and 1
            # Note: For self_esteem, sleep_quality, basic_needs, safety, living_conditions, teacher_student_relationship, social_support,
            # higher value is positive (lowers stress), so lower value represents higher risk/contribution.
            reverse_features = {"self_esteem", "sleep_quality", "basic_needs", "safety", "living_conditions", "teacher_student_relationship", "social_support", "academic_performance"}
            
            norm_val = float(value) / max_val
            if name in reverse_features:
                norm_val = 1.0 - norm_val # low value = high contribution to stress
                
            contribution_score = norm_val * imp
            contributions.append({
                "feature": name,
                "value": value,
                "score": contribution_score
            })
            
        # Sort contributions descending to show top contributors
        contributions = sorted(contributions, key=lambda x: x["score"], reverse=True)
        
        return jsonify({
            "stress_level": prediction,
            "label": predicted_label,
            "confidence": confidence,
            "probabilities": {stress_levels_map[i]: float(prob) for i, prob in enumerate(probabilities)},
            "top_contributors": contributions[:5]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
