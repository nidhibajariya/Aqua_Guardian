import requests
import uuid

BASE_URL = "http://127.0.0.1:8000"

def test_multi_user_reporting():
    user_ids = [str(uuid.uuid4()), str(uuid.uuid4())]
    
    for i, uid in enumerate(user_ids):
        print(f"\n--- Testing User {i+1} (ID: {uid}) ---")
        
        # Mocking a report submission
        # We need a dummy image for the File upload
        with open("test_image.jpg", "wb") as f:
            f.write(b"dummy image data")
            
        files = {
            "file": ("test.jpg", open("test_image.jpg", "rb"), "image/jpeg")
        }
        data = {
            "user_id": uid,
            "latitude": 12.345,
            "longitude": 67.890,
            "description": f"Test report from user {i+1}",
            "severity": 3
        }
        
        try:
            res = requests.post(f"{BASE_URL}/reports/", data=data, files=files)
            if res.status_code == 200:
                print(f"✅ Report created successfully for user {i+1}!")
                print(f"Report ID: {res.json()['id']}")
            else:
                print(f"❌ Failed to create report for user {i+1}: {res.status_code}")
                print(res.text)
        except Exception as e:
            print(f"❌ Exception during reporting for user {i+1}: {e}")

if __name__ == "__main__":
    test_multi_user_reporting()
