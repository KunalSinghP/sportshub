import requests

API = "https://sportshub-hjro.onrender.com"

# Register a unique user
import time
username = f"testuser_{int(time.time())}"
password = "testpassword123"

# Register
reg_res = requests.post(f"{API}/auth/register", json={"username": username, "password": password})
print(f"Register: {reg_res.status_code}")

# Login
login_res = requests.post(f"{API}/auth/token", data={"username": username, "password": password})
if not login_res.ok:
    print("Login failed")
else:
    token = login_res.json().get("access_token")
    print("Got token.")
    
    # Test post comment
    post_res = requests.post(f"{API}/posts/2/comments", json={"content": "This is a test comment"}, headers={"Authorization": f"Bearer {token}"})
    print(f"Comment: {post_res.status_code} - {post_res.text}")
