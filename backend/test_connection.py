import os
from dotenv import load_dotenv
import pathlib
from supabase import create_client

# Force load .env
env_path = pathlib.Path(__file__).parent / '.env'
print(f"Loading .env from: {env_path}")
load_dotenv(dotenv_path=env_path)

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

print(f"URL: {url}")
print(f"KEY: {key[:10]}..." if key else "KEY: None")

if not url or not key:
    print("❌ Missing Credentials!")
    exit(1)

try:
    print("Attempting to connect to Supabase...")
    supabase = create_client(url, key)
    
    # Try a simple select to verify access
    print("Selecting from 'reports'...")
    res = supabase.table("reports").select("id").limit(1).execute()
    print("✅ Connection Successful!")
    print(f"Data sample: {res.data}")
except Exception as e:
    print(f"❌ Connection Failed: {e}")
