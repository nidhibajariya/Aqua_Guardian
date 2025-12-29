import requests
import time

URL = "http://127.0.0.1:8000/reports/"
AUTH_TOKEN = None  # You might need to login first if auth is required

# Mock Image
files = {
    'file': ('test.jpg', b'fake image data', 'image/jpeg')
}
data = {
    'user_id': 'test_user', # Using deprecated field but backend extracts from token... wait.
    # The new backend requires Authorization header!
    # I need a valid token to test this, or I need to bypass auth for testing.
    # Diagnosing: The existing backend requires `get_current_user`.
    # I will first check if I can hit the endpoint at all.
    'latitude': 10.0,
    'longitude': 10.0,
    'description': 'Test report',
    'severity': 3
}

# Login first to get token
LOGIN_URL = "http://127.0.0.1:8000/auth/login"
# I don't have user credentials. I will try to see if I can get a 401.
# If I get 401, the server is reachable.
# If I get timeout, the server is hung.

print("Testing direct report submission...")
try:
    resp = requests.post(URL, files=files, data=data, timeout=10)
    print(f"Response: {resp.status_code}")
    print(resp.text)
except Exception as e:
    print(f"Request failed: {e}")
