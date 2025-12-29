import requests
import time

# Base URL of the backend
API_URL = "http://127.0.0.1:8000"

def test_report_action_flow():
    print("=== Testing Report Action Tracking Flow ===")
    
    # 1. Get an existing report ID (or we could create one, but let's try to find one first)
    print("\n1. Fetching recent reports...")
    try:
        res = requests.get(f"{API_URL}/reports/")
        reports = res.json()
        if not reports:
            print("No reports found to test with.")
            return
        
        target_report = reports[0]
        report_id = target_report['id']
        print(f"Targeting Report ID: {report_id} (Current Status: {target_report.get('status')})")
        
        # 2. Update status to 'Sent to authorities'
        print(f"\n2. Updating status to 'Sent to authorities'...")
        data = {
            "status": "Sent to authorities",
            "action_note": "Report dispatched to local NGO and Pollution Control Board."
        }
        res = requests.post(f"{API_URL}/reports/{report_id}/status", data=data)
        if res.status_code == 200:
            updated = res.json()
            print(f"SUCCESS: Status updated to {updated['status']}")
            print(f"Action Note: {updated['action_note']}")
            print(f"Updated At: {updated['updated_at']}")
        else:
            print(f"FAILED: {res.status_code} - {res.text}")
            return

        # 3. Update status to 'Action in progress'
        time.sleep(1)
        print(f"\n3. Updating status to 'Action in progress'...")
        data = {
            "status": "Action in progress",
            "action_note": "A cleanup team has been assigned and is currently on-site."
        }
        res = requests.post(f"{API_URL}/reports/{report_id}/status", data=data)
        print(f"SUCCESS: Status updated to {res.json()['status']}")

        # 4. Verify the details via GET
        print(f"\n4. Verifying final state via GET /reports/{report_id}...")
        res = requests.get(f"{API_URL}/reports/{report_id}")
        final_report = res.json()
        print(f"Final Status: {final_report['status']}")
        print(f"Final Note: {final_report['action_note']}")
        
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_report_action_flow()
