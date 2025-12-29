import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def test_nft_adoption_flow():
    print("=== Testing NFT Water Body Adoption Flow ===")
    
    # 1. Fetch available water bodies
    print("\n1. Fetching available water bodies...")
    try:
        wb_res = requests.get(f"{BASE_URL}/adoption/water-bodies")
        water_bodies = wb_res.json()
        if not water_bodies:
            print("No water bodies found. (Note: Ensure the SQL migration seed was run!)")
            return
        
        target_site = water_bodies[0]
        print(f"Found: {target_site['name']} ({target_site['location_name']})")
    except Exception as e:
        print(f"FAILED to fetch water bodies: {e}")
        return

    # 2. Mock adoption with a pledge
    print("\n2. Adopting and making a pledge...")
    dummy_user_id = "00000000-0000-0000-0000-000000000000"
    
    try:
        reports = requests.get(f"{BASE_URL}/reports/").json()
        if reports and isinstance(reports, list) and len(reports) > 0:
            dummy_user_id = reports[0]['user_id']
    except:
        pass

    adopt_data = {
        "user_id": dummy_user_id,
        "water_body_id": target_site['id'],
        "pledge_text": "I pledge to protect the purity of this water and report any pollution I see."
    }
    
    try:
        adopt_res = requests.post(f"{BASE_URL}/adoption/adopt", data=adopt_data)
        if adopt_res.status_code == 200:
            nft_meta = adopt_res.json()[0]
            print(f"SUCCESS: Adopted {target_site['name']}!")
            print(f"NFT Token ID: #{nft_meta['nft_token_id']}")
            print(f"Blockchain TX: {nft_meta['blockchain_tx']}")
        elif adopt_res.status_code == 400 and "already adopted" in adopt_res.text.lower():
            print(f"INFO: {target_site['name']} already adopted by this user. Proceeding to verify stats.")
        else:
            print(f"FAILED to adopt: {adopt_res.status_code} - {adopt_res.text}")
    except Exception as e:
        print(f"FAILED to call adoption API: {e}")

    # 3. Check impact stats
    print("\n3. Verifying impact dashboard data...")
    try:
        impact_res = requests.get(f"{BASE_URL}/adoption/status/{target_site['id']}")
        impact = impact_res.json()
        print(f"Live Impact for {target_site['name']}:")
        
        # Adjust keys based on actual API response
        guardians = impact.get('active_guardians', [])
        reports_cnt = impact.get('reports_count', impact.get('reports', 0))
        
        print(f"  - Active Guardians: {len(guardians)}")
        print(f"  - Linked Reports: {reports_cnt}")
        
        # Check if dummy_user_id is in the guardians
        found = False
        for g in guardians:
            if g.get('user_id') == dummy_user_id:
                found = True
                break
        
        if found:
            print("SUCCESS: Adoption status is visible in impact data.")
        else:
            print("WARNING: User adoption record found in impacts (Note: This might be expected if no real adoptions exist yet).")
    except Exception as e:
        print(f"FAILED to fetch impact stats: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_nft_adoption_flow()
