import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from generate_data import generate_dataset

def train_model():
    dataset_path = os.path.join(os.path.dirname(__file__), "../StressLevelDataset_1.csv")
    
    # Generate data if necessary
    generate_dataset(dataset_path)
    
    # Load dataset
    print("Loading dataset for training...")
    df = pd.read_csv(dataset_path)
    
    # Verify shape
    print(f"Dataset shape: {df.shape}")
    
    # Split features and target
    X = df.drop(columns=["stress_level"])
    y = df["stress_level"]
    
    feature_names = list(X.columns)
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print(f"Training set size: {X_train.shape[0]}")
    print(f"Testing set size: {X_test.shape[0]}")
    
    # Train Random Forest Classifier
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
    model.fit(X_train, y_train)
    
    # Predict and evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save model and feature list
    model_data = {
        "model": model,
        "feature_names": feature_names,
        "metrics": {
            "accuracy": float(accuracy)
        }
    }
    
    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    joblib.dump(model_data, model_path)
    print(f"Model successfully saved to {model_path}")
    
    # Print feature importances
    importances = model.feature_importances_
    feat_importances = pd.Series(importances, index=feature_names).sort_values(ascending=False)
    print("\nTop 10 Feature Importances:")
    print(feat_importances.head(10))

if __name__ == "__main__":
    train_model()
