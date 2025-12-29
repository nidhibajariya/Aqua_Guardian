from db.supabase import supabase

def upload_file(file_bytes, file_name, bucket="photos"):
    try:
        response = supabase.storage.from_(bucket).upload(file_name, file_bytes)
        return response
    except Exception as e:
        print(f"Error uploading file: {e}")
        return None

def get_public_url(file_path, bucket="photos"):
    return supabase.storage.from_(bucket).get_public_url(file_path)
