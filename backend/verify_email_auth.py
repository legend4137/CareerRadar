import requests
import random
import string

API_URL = "http://localhost:8001/api/auth"

def random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def run_test():
    email = f"test_{random_string(4)}@example.com"
    name = "Test User"
    password = "password123"
    
    # 1. Signup
    print(f"Testing signup with Email: {email}")
    payload = {
        "name": name,
        "email": email,
        "password": password
    }
    res = requests.post(f"{API_URL}/signup", json=payload)
    
    if res.status_code == 200:
        data = res.json()
        print("Signup successful.")
        if "username" in data.get("user", {}):
            print("FAILED: Username still present in response.")
        else:
            print("SUCCESS: Username not in response.")
    else:
        print(f"Signup failed: {res.text}")
        return

    # 2. Login
    print(f"Testing login with Email: {email}")
    login_payload = {
        "email": email,
        "password": password
    }
    res_login = requests.post(f"{API_URL}/login", json=login_payload)
    
    if res_login.status_code == 200:
        print("Login successful.")
    else:
        print(f"Login failed: {res_login.text}")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"Test failed: {e}")
        print("Note: Ensure the backend is running at http://localhost:8001")
