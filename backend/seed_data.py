"""
Seed Data Script for Aqua Guardian
Populates the database with initial water quality readings and simulates ongoing sensor data.
"""
import os
import sys
import random
import time
from datetime import datetime
from dotenv import load_dotenv

# Add parent directory to path to import backend modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db.supabase import supabase

def add_water_quality_reading():
    """Add a simulated water quality reading to the database."""
    try:
        reading = {
            "location": "Mumbai Harbor Monitoring Station",
            "latitude": 19.0760,
            "longitude": 72.8777,
            "ph": round(random.uniform(6.5, 8.5), 2),
            "turbidity": round(random.uniform(0.5, 5.0), 2),
            "oxygen": round(random.uniform(5.0, 10.0), 2),
            "salinity": round(random.uniform(0.1, 1.0), 2),
            "temperature": round(random.uniform(20.0, 30.0), 2)
        }
        
        result = supabase.table("water_quality_readings").insert(reading).execute()
        
        if result.data:
            print(f"✅ Added water quality reading: pH={reading['ph']}, Temp={reading['temperature']}°C")
            return True
        else:
            print("❌ Failed to add reading")
            return False
    except Exception as e:
        print(f"❌ Error adding reading: {e}")
        return False

def simulate_sensor_data(interval_seconds=10, count=10):
    """
    Simulate sensor data by adding readings at regular intervals.
    
    Args:
        interval_seconds: Time between readings
        count: Number of readings to add (0 for infinite)
    """
    print(f"🌊 Starting sensor simulation...")
    print(f"   Interval: {interval_seconds} seconds")
    print(f"   Count: {'Infinite' if count == 0 else count}")
    print()
    
    readings_added = 0
    
    try:
        while count == 0 or readings_added < count:
            if add_water_quality_reading():
                readings_added += 1
            
            if count == 0 or readings_added < count:
                time.sleep(interval_seconds)
    except KeyboardInterrupt:
        print(f"\n⏸️  Simulation stopped. Added {readings_added} readings.")

def check_database_connection():
    """Check if database connection is working."""
    try:
        result = supabase.table("water_quality_readings").select("id").limit(1).execute()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    load_dotenv()
    
    print("=" * 60)
    print("🌊 Aqua Guardian - Seed Data Script")
    print("=" * 60)
    print()
    
    # Check database connection
    if not check_database_connection():
        print("\n⚠️  Please ensure:")
        print("   1. You've run the SQL migration (add_dashboard_tables.sql)")
        print("   2. Your .env file has correct SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        sys.exit(1)
    
    print()
    print("Choose an option:")
    print("1. Add a single water quality reading")
    print("2. Simulate sensor data (10 readings, 10 second intervals)")
    print("3. Simulate sensor data (continuous, 5 second intervals)")
    print()
    
    choice = input("Enter choice (1-3): ").strip()
    
    if choice == "1":
        add_water_quality_reading()
    elif choice == "2":
        simulate_sensor_data(interval_seconds=10, count=10)
    elif choice == "3":
        simulate_sensor_data(interval_seconds=5, count=0)
    else:
        print("Invalid choice")
