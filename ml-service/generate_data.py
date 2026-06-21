import os
import pandas as pd
import numpy as np

def generate_dataset(file_path):
    print(f"Checking dataset at: {file_path}")
    if os.path.exists(file_path) and os.path.getsize(file_path) > 100:
        print("Dataset already exists and is not empty. Skipping generation.")
        return

    print("Dataset empty or missing. Generating 1100 records of synthetic stress data...")
    np.random.seed(42)
    n_samples = 1100
    
    # Split: Low, Medium, High Stress
    n_low = 360
    n_med = 380
    n_high = 360
    
    data = []
    
    # Low Stress Group (stress_level = 0)
    for _ in range(n_low):
        rec = {
            "anxiety_level": int(np.clip(np.random.normal(5, 2.5), 0, 21)),
            "self_esteem": int(np.clip(np.random.normal(24, 3), 0, 30)),
            "mental_health_history": int(np.random.choice([0, 1], p=[0.8, 0.2])),
            "depression": int(np.clip(np.random.normal(5, 2.5), 0, 27)),
            "headache": int(np.clip(np.random.normal(1.2, 0.8), 0, 5)),
            "blood_pressure": int(np.random.choice([1, 2, 3], p=[0.7, 0.25, 0.05])),
            "sleep_quality": int(np.clip(np.random.normal(4.2, 0.8), 0, 5)),
            "breathing_problem": int(np.clip(np.random.normal(1.1, 0.8), 0, 5)),
            "noise_level": int(np.clip(np.random.normal(1.5, 0.8), 0, 5)),
            "living_conditions": int(np.clip(np.random.normal(4.2, 0.8), 0, 5)),
            "safety": int(np.clip(np.random.normal(4.3, 0.7), 0, 5)),
            "basic_needs": int(np.clip(np.random.normal(4.4, 0.6), 0, 5)),
            "academic_performance": int(np.clip(np.random.normal(4.2, 0.7), 0, 5)),
            "study_load": int(np.clip(np.random.normal(1.7, 0.8), 0, 5)),
            "teacher_student_relationship": int(np.clip(np.random.normal(4.3, 0.7), 0, 5)),
            "future_career_concerns": int(np.clip(np.random.normal(1.6, 0.8), 0, 5)),
            "social_support": int(np.clip(np.random.normal(4.4, 0.6), 0, 5)),
            "peer_pressure": int(np.clip(np.random.normal(1.5, 0.8), 0, 5)),
            "extracurricular_activities": int(np.clip(np.random.normal(2.5, 1.0), 0, 5)),
            "bullying": int(np.clip(np.random.normal(0.8, 0.7), 0, 5)),
            "stress_level": 0
        }
        data.append(rec)

    # Medium Stress Group (stress_level = 1)
    for _ in range(n_med):
        rec = {
            "anxiety_level": int(np.clip(np.random.normal(12, 3.0), 0, 21)),
            "self_esteem": int(np.clip(np.random.normal(17, 4), 0, 30)),
            "mental_health_history": int(np.random.choice([0, 1], p=[0.5, 0.5])),
            "depression": int(np.clip(np.random.normal(12, 3.5), 0, 27)),
            "headache": int(np.clip(np.random.normal(2.6, 0.9), 0, 5)),
            "blood_pressure": int(np.random.choice([1, 2, 3], p=[0.2, 0.6, 0.2])),
            "sleep_quality": int(np.clip(np.random.normal(2.7, 0.9), 0, 5)),
            "breathing_problem": int(np.clip(np.random.normal(2.5, 0.9), 0, 5)),
            "noise_level": int(np.clip(np.random.normal(2.8, 1.0), 0, 5)),
            "living_conditions": int(np.clip(np.random.normal(2.9, 0.9), 0, 5)),
            "safety": int(np.clip(np.random.normal(2.9, 0.9), 0, 5)),
            "basic_needs": int(np.clip(np.random.normal(2.8, 0.9), 0, 5)),
            "academic_performance": int(np.clip(np.random.normal(2.8, 0.9), 0, 5)),
            "study_load": int(np.clip(np.random.normal(2.9, 0.9), 0, 5)),
            "teacher_student_relationship": int(np.clip(np.random.normal(2.9, 0.9), 0, 5)),
            "future_career_concerns": int(np.clip(np.random.normal(2.8, 0.9), 0, 5)),
            "social_support": int(np.clip(np.random.normal(2.8, 0.9), 0, 5)),
            "peer_pressure": int(np.clip(np.random.normal(2.7, 0.9), 0, 5)),
            "extracurricular_activities": int(np.clip(np.random.normal(2.5, 1.0), 0, 5)),
            "bullying": int(np.clip(np.random.normal(2.4, 0.9), 0, 5)),
            "stress_level": 1
        }
        data.append(rec)

    # High Stress Group (stress_level = 2)
    for _ in range(n_high):
        rec = {
            "anxiety_level": int(np.clip(np.random.normal(17, 2.5), 0, 21)),
            "self_esteem": int(np.clip(np.random.normal(10, 3.5), 0, 30)),
            "mental_health_history": int(np.random.choice([0, 1], p=[0.2, 0.8])),
            "depression": int(np.clip(np.random.normal(20, 3.0), 0, 27)),
            "headache": int(np.clip(np.random.normal(4.1, 0.8), 0, 5)),
            "blood_pressure": int(np.random.choice([1, 2, 3], p=[0.05, 0.25, 0.7])),
            "sleep_quality": int(np.clip(np.random.normal(1.2, 0.8), 0, 5)),
            "breathing_problem": int(np.clip(np.random.normal(4.2, 0.8), 0, 5)),
            "noise_level": int(np.clip(np.random.normal(4.1, 0.8), 0, 5)),
            "living_conditions": int(np.clip(np.random.normal(1.4, 0.8), 0, 5)),
            "safety": int(np.clip(np.random.normal(1.3, 0.8), 0, 5)),
            "basic_needs": int(np.clip(np.random.normal(1.2, 0.8), 0, 5)),
            "academic_performance": int(np.clip(np.random.normal(1.4, 0.8), 0, 5)),
            "study_load": int(np.clip(np.random.normal(4.2, 0.8), 0, 5)),
            "teacher_student_relationship": int(np.clip(np.random.normal(1.3, 0.8), 0, 5)),
            "future_career_concerns": int(np.clip(np.random.normal(4.3, 0.7), 0, 5)),
            "social_support": int(np.clip(np.random.normal(1.4, 0.8), 0, 5)),
            "peer_pressure": int(np.clip(np.random.normal(4.2, 0.8), 0, 5)),
            "extracurricular_activities": int(np.clip(np.random.normal(2.5, 1.0), 0, 5)),
            "bullying": int(np.clip(np.random.normal(4.3, 0.7), 0, 5)),
            "stress_level": 2
        }
        data.append(rec)
        
    df = pd.DataFrame(data)
    df.to_csv(file_path, index=False)
    print(f"Successfully generated 1100 stress logs at {file_path}")

if __name__ == "__main__":
    generate_dataset("../StressLevelDataset_1.csv")
