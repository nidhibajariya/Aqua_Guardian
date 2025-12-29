import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def test_cleanup_flow():
    print("=== Testing Community Cleanup Flow ===")
    
    # 1. Fetch recent reports to find a target
    print("\n1. Fetching recent reports...")
    reports = requests.get(f"{BASE_URL}/reports/").json()
    if not reports:
        print("No reports found. Submit a report first.")
        return
    
    target_report = reports[0]
    report_id = target_report['id']
    print(f"Targeting Report ID: {report_id}")
    
    # 2. Start a cleanup action
    print("\n2. Starting cleanup action...")
    clean_res = requests.post(f"{BASE_URL}/cleanup/{report_id}/start", data={
        "actor_id": target_report['user_id'],
        "organization": "Green Earth NGO"
    }).json()
    
    if not clean_res:
        print("Failed to start cleanup. (Note: Ensure the SQL migration was run!)")
        return
        
    cleanup_id = clean_res[0]['id']
    print(f"Cleanup ID: {cleanup_id}")
    
    # 3. Join as a volunteer
    print("\n3. Joining as a volunteer...")
    join_res = requests.post(f"{BASE_URL}/cleanup/{cleanup_id}/join", data={
        "user_id": target_report['user_id'], # Using same user as volunteer for test
        "role": "Student"
    })
    
    if join_res.status_code == 200:
        print("SUCCESS: Joined cleanup team.")
    else:
        print(f"FAILED to join: {join_res.text}")
        
    # 4. Update progress to 50%
    print("\n4. Updating progress to 50%...")
    update_res = requests.post(f"{BASE_URL}/cleanup/{cleanup_id}/update", data={
        "progress": 50,
        "remark": "Site preparation complete. Trash collection in progress."
    }).json()
    print(f"Progress updated to: {update_res[0]['progress']}%")
    
    # 5. Verify public active board
    print("\n5. Verifying public active board...")
    active_res = requests.get(f"{BASE_URL}/cleanup/active").json()
    found = any(c['id'] == cleanup_id for c in active_res)
    if found:
        print("SUCCESS: Cleanup visible on public board.")
    else:
        print("FAILED: Cleanup not found on public board.")

if __name__ == "__main__":
    test_cleanup_flow()
