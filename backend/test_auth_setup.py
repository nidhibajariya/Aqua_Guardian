import os
from dotenv import load_dotenv
from supabase import create_client
import pathlib
import time
import random

# Load env
env_path = pathlib.Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Use Service Role to bypass RLS/Confirm for setup, but we want to test client flow ideally.
# Actually, to reproduce user issue, we should use the ANON key if possible, but we don't have it easily.
# We will use Service Role Key but check the User flags.

if not url or not key:
    print("Missing credentials")
    exit(1)

supabase = create_client(url, key)

email = f"testuser_{random.randint(1000,9999)}@example.com"
password = "TestPassword123!"

print(f"1. Attempting to Sign Up user: {email}")
try:
    # Use generic sign_up which mimics client behavior usually, 
    # but with Service Role key, it might auto-confirm depending on settings.
    # Let's try to simulate client behavior by NOT auto-confirming if possible, 
    # but the python client with service key acts as admin.
    
    # Actually, let's use the explicit admin create user to see status,
    # OR just try sign_up.
    res = supabase.auth.sign_up({"email": email, "password": password})
    
    print(f"   Sign up result: User ID {res.user.id}")
    print(f"   Confirmed at: {res.user.email_confirmed_at}")
    
    if res.user.email_confirmed_at is None:
        print("   ⚠️  Email is NOT confirmed automatically.")
        print("   This confirms that Email Verification is ENABLED in your Supabase project.")
        print("   Users cannot login until they click the link in their email.")
    else:
        print("   ✅ Email IS confirmed automatically.")
    
    print("\n2. Attempting Login with new user...")
    try:
        login_res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        print("   ✅ Login Successful!")
    except Exception as login_err:
        print(f"   ❌ Login Failed: {login_err}")

except Exception as e:
    print(f"❌ Verification failed: {e}")
