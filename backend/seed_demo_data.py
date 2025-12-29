import os
import random
import uuid
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env")
    exit(1)

supabase = create_client(url, key)

# ... (imports)

# ...

print("Seeding database with demo data...")

# ---- Get or Create Demo User ----
print("Getting existing users from auth.users...")
demo_email = "demo@aquaguardian.com"
user_id = None

try:
    # List all existing users
    users_list = supabase.auth.admin.list_users()
    
    if users_list and len(users_list) > 0:
        # Use the first available user
        user_id = users_list[0].id
        demo_email = users_list[0].email or "demo@aquaguardian.com"
        print(f"Found existing user: {user_id} ({demo_email})")
    else:
        print("No users found in auth.users. Please create a user via Supabase Dashboard first.")
        print("Go to: Authentication > Users > Add User")
        exit(1)
except Exception as e:
    print(f"Error fetching users: {e}")
    print("Please ensure at least one user exists in auth.users")
    exit(1)

# Give Supabase a moment to propagate the auth user
print("Waiting for auth user to propagate...")
time.sleep(2)

reports = []
# Use the real user_id
demo_user_id = user_id

# Ensure user exists in public.users
print(f"Upserting user into public.users (ID: {demo_user_id})...")
user_data = {
    "id": demo_user_id,
    "email": demo_email,
    "role": "citizen"
}
try:
    # First check if user exists in public.users
    existing = supabase.table("users").select("*").eq("id", demo_user_id).execute()
    if existing.data:
        print(f"User already exists in public.users: {demo_user_id}")
    else:
        # Insert the user
        print(f"Attempting to insert user with data: {user_data}")
        result = supabase.table("users").insert(user_data).execute()
        if result.data:
            print(f"✅ Inserted user into public.users: {demo_user_id}")
        else:
            print(f"❌ Failed to insert user, result: {result}")
            print("CRITICAL: Cannot proceed without user in public.users table")
            exit(1)
except Exception as e:
    print(f"❌ Error with public.users: {e}")
    print(f"Full error details: {type(e).__name__}: {str(e)}")
    print("CRITICAL: Cannot proceed without user in public.users table")
    exit(1)

for i in range(30):  # Create 30 random reports
    pass

locations = [
    {"name": "Mumbai Harbor", "lat": 18.9438, "lng": 72.8354},
    {"name": "Ganges Delta", "lat": 22.6855, "lng": 88.3667},
    {"name": "Chennai Marina", "lat": 13.0500, "lng": 80.2824},
    {"name": "Kochi Backwaters", "lat": 9.9312, "lng": 76.2673},
    {"name": "Yamuna River", "lat": 28.6139, "lng": 77.2090},
    {"name": "Chilika Lake", "lat": 19.8450, "lng": 85.4788},
    {"name": "Juhu Beach", "lat": 19.0988, "lng": 72.8264},
    {"name": "Versova Beach", "lat": 19.1320, "lng": 72.8130},
    {"name": "Dal Lake", "lat": 34.1130, "lng": 74.8697},
    {"name": "Hussain Sagar", "lat": 17.4239, "lng": 78.4738}
]

pollution_types = [
    "Industrial Discharge", "Plastic Pollution", "Oil Spill", 
    "Sewage Overflow", "Chemical Contamination", "Agricultural Runoff"
]

statuses = ["pending", "investigating", "resolved"]

for i in range(30):  # Create 30 random reports
    loc = random.choice(locations)
    p_type = random.choice(pollution_types)
    status = random.choice(statuses)
    
    # Severity logic
    severity = random.randint(1, 10)
    if p_type in ["Oil Spill", "Chemical Contamination"]:
        severity = random.randint(7, 10)
    elif p_type == "Plastic Pollution":
        severity = random.randint(3, 8)
        
    # Date logic (last 30 days)
    days_ago = random.randint(0, 30)
    created_at = (datetime.now() - timedelta(days=days_ago)).isoformat()
    
    report = {
        "latitude": loc["lat"] + random.uniform(-0.01, 0.01),
        "longitude": loc["lng"] + random.uniform(-0.01, 0.01),
        "severity": severity,
        "description": f"{p_type} at {loc['name']}: Detected {p_type.lower()}. Severity level {severity}.",
        "user_id": demo_user_id,
        "status": status,
        "created_at": created_at
    }
    reports.append(report)

try:
    supabase.table("reports").insert(reports).execute()
    print(f"Inserted {len(reports)} reports.")
except Exception as e:
    print(f"Error inserting reports: {e}")

# ---- 3. Seed Water Quality Readings ----
print("Seeding water quality readings...")
readings = []
base_time = datetime.now()

for i in range(50): # 50 readings
    time_offset = i * 30 # every 30 minutes roughly
    recorded_at = (base_time - timedelta(minutes=time_offset)).isoformat()
    
    reading = {
        "location": "Mumbai Harbor Monitoring Station",
        "ph": round(random.uniform(6.5, 8.5), 2),
        "turbidity": round(random.uniform(0.5, 5.0), 2),
        "oxygen": round(random.uniform(5.0, 9.0), 2),
        "salinity": round(random.uniform(30.0, 36.0), 2),
        "temperature": round(random.uniform(24.0, 30.0), 2),
        "recorded_at": recorded_at
    }
    readings.append(reading)

try:
    supabase.table("water_quality_readings").insert(readings).execute()
    print(f"Inserted {len(readings)} water quality readings.")
except Exception as e:
    print(f"Error inserting water quality readings: {e}")

# ---- 4. Seed Success Stories ----
print("Seeding success stories...")
stories = [
    {
        "title": "Mumbai Harbor Cleanup Drive",
        "location": "Mumbai Harbor",
        "timeframe": "Jan 2025",
        "description": "Over 500 volunteers gathered to remove 2 tons of plastic waste from the harbor area.",
        "image_url": "https://images.unsplash.com/photo-1618477461853-5f8dd68aa395?q=80&w=1000&auto=format&fit=crop",
        "status": "Completed",
        "water_quality_improved": 15,
        "species_recovered": 3,
        "lives_impacted": 2000,
        "pollution_reduced": 25,
        "challenges": "High tides and heavy monsoon rains made access difficult.",
        "solutions": "Used specialized floating barriers and organized shifts during low tide.",
        "results": "Significantly cleaner shoreline and return of local crab species.",
        "stakeholders": "Local Municipality, Ocean NGOs, Student Volunteers"
    },
    {
        "title": "Yamuna River Restoration Project",
        "location": "Yamuna River, Delhi",
        "timeframe": "Ongoing 2025",
        "description": "Implementation of new bio-filtration systems to treat industrial effluent before it enters the river.",
        "image_url": "https://images.unsplash.com/photo-1596436643303-56718c477477?q=80&w=1000&auto=format&fit=crop",
        "status": "In Progress",
        "water_quality_improved": 8,
        "species_recovered": 0,
        "lives_impacted": 50000,
        "pollution_reduced": 12,
        "challenges": "Large volume of untreated sewage and industrial waste.",
        "solutions": "Installing decentralized sewage treatment plants and strict monitoring.",
        "results": "Reduction in foam formation and slight improvement in dissolved oxygen levels.",
        "stakeholders": "Government of Delhi, Environmental Experts, Local Communities"
    },
    {
        "title": "Turtle Conservation in Odisha",
        "location": "Chilika Lake",
        "timeframe": "Dec 2024",
        "description": "Protected nesting sites for Olive Ridley turtles resulting in record hatchings.",
        "image_url": "https://images.unsplash.com/photo-1437622643473-f66b74c58db6?q=80&w=1000&auto=format&fit=crop",
        "status": "Success",
        "water_quality_improved": 5,
        "species_recovered": 1200,
        "lives_impacted": 500,
        "pollution_reduced": 10,
        "challenges": "Illegal fishing trawlers and plastic debris.",
        "solutions": "Patrolling by forest guards and community awareness programs.",
        "results": "Record number of hatchlings safely reached the ocean.",
        "stakeholders": "Forest Department, Local Fishermen, Wildlife Fund"
    }
]

try:
    supabase.table("success_stories").insert(stories).execute()
    print(f"Inserted {len(stories)} success stories.")
except Exception as e:
    print(f"Error inserting success stories: {e}")

print("Database seeding completed!")
