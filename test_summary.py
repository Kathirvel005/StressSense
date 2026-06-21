import urllib.request
import urllib.error
import json

def make_post_request(url, data, headers={}):
    payload = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={**headers, 'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return 500, str(e)

def make_get_request(url, headers={}):
    req = urllib.request.Request(url, headers=headers, method='GET')
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return 500, str(e)

def test_api():
    base_url = "http://localhost:8080"
    
    # 1. Register a user
    register_url = f"{base_url}/api/auth/register"
    user_data = {
        "username": "test_user_debug_3",
        "email": "debug3@example.com",
        "password": "password123",
        "role": "USER"
    }
    
    print("Testing User Registration...")
    status, res = make_post_request(register_url, user_data)
    print(f"Status Code: {status}")
    if status != 200:
        print(f"Error: {res}")
        return
        
    token = res["token"]
    print("User registered successfully. Token obtained.")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # 2. Run Prediction
    predict_url = f"{base_url}/api/predictions/predict"
    predict_data = {
        "anxiety_level": 12,
        "self_esteem": 18,
        "mental_health_history": 0,
        "depression": 10,
        "headache": 2,
        "blood_pressure": 2,
        "sleep_quality": 3,
        "breathing_problem": 2,
        "noise_level": 2,
        "living_conditions": 3,
        "safety": 3,
        "basic_needs": 3,
        "academic_performance": 3,
        "study_load": 3,
        "teacher_student_relationship": 3,
        "future_career_concerns": 3,
        "social_support": 3,
        "peer_pressure": 3,
        "extracurricular_activities": 3,
        "bullying": 1
    }
    
    print("\nTesting Stress Prediction API...")
    status, res = make_post_request(predict_url, predict_data, headers)
    print(f"Status Code: {status}")
    if status != 200:
        print(f"Error: {res}")
        return
    print("Prediction call successful.")
    print(json.dumps(res, indent=2))
    
    # 3. Get Analytics Summary
    summary_url = f"{base_url}/api/analytics/summary"
    print("\nTesting Analytics Summary API...")
    status, res = make_get_request(summary_url, headers)
    print(f"Status Code: {status}")
    if status != 200:
        print(f"Error: {res}")
        return
        
    print("Analytics Summary payload retrieved successfully:")
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    test_api()
