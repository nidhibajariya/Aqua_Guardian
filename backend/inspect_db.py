from db.supabase import supabase

def inspect_db():
    try:
        # Check for triggers
        print("--- Triggers ---")
        triggers = supabase.rpc("inspect_triggers").execute()
        print(triggers.data)
        
        # Check for functions
        print("\n--- Functions ---")
        functions = supabase.rpc("inspect_functions").execute()
        print(functions.data)
        
    except Exception as e:
        print(f"Error inspecting DB: {e}")
        print("Note: If 'inspect_triggers' RPC doesn't exist, we can't see them easily via client.")

    # Let's try to see if public.users has any rows
    try:
        print("\n--- public.users count ---")
        res = supabase.table("users").select("count", count="exact").execute()
        print(f"Total users in profiles: {res.count}")
    except Exception as e:
        print(f"Error checking users table: {e}")

if __name__ == "__main__":
    inspect_db()
