import os
import uuid
import sys
from supabase import create_client, Client
from dotenv import load_dotenv
import pathlib

# Load environment variables
env_path = pathlib.Path(__file__).parent / 'backend' / '.env'
load_dotenv(dotenv_path=env_path)

url = os.environ.get("SUPABASE_URL")
# Use Service Role Key to bypass any RLS for testing
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env")
    sys.exit(1)

supabase: Client = create_client(url, key)

def test_signup():
    test_email = f"test_user_{uuid.uuid4().hex[:8]}@example.com"
    test_password = "testPassword123!"
    test_name = "Test User"
    
    print(f"Attempting signup for: {test_email}")
    
    try:
        res = supabase.auth.sign_up({
            "email": test_email,
            "password": test_password,
            "options": {
                "data": {
                    "name": test_name,
                    "role": "Citizen"
                }
            }
        })
        
        if res.user:
            print(f"✅ Signup successful! User ID: {res.user.id}")
        else:
            print("❌ Signup failed: No user returned")
            print(res)
            
    except Exception as e:
        print(f"❌ Signup failed with exception: {e}")

if __name__ == "__main__":
    test_signup()
