import os
from supabase import create_client, Client
from dotenv import load_dotenv
import pathlib
from middleware.logging import logger

# Explicitly load .env from the same directory as this file or parent
env_path = pathlib.Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

try:
    supabase: Client = create_client(url, key)
except Exception as e:
    logger.error(f"❌ Failed to initialize Supabase client: {e}")
    raise e
