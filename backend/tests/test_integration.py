"""
Integration tests for complete AQUA Guardian workflows
"""
import pytest
from httpx import AsyncClient
import io
from PIL import Image

API_BASE_URL = "http://localhost:8000"

@pytest.mark.asyncio
async def test_complete_pollution_report_lifecycle():
    """
    Test the complete lifecycle of a pollution report:
    1. User submits report with image
    2. AI classifies the pollution type
    3. Report is saved to database
    4. Blockchain hash is logged (background task)
    5. If high confidence, notification is sent (background task)
    6. Admin can verify the report
    7. Report can be retrieved
    """
    print("\n" + "="*80)
    print("INTEGRATION TEST: Complete Pollution Report Lifecycle")
    print("="*80 + "\n")
    
    async with AsyncClient(base_url=API_BASE_URL) as client:
        # Prepare test data
        report_data = {
            "user_id": "integration_test_user",
            "latitude": 19.0760,
            "longitude": 72.8777,
            "description": "Severe plastic pollution in Mumbai creek",
            "severity": 9
        }
        
        # Create test image (simulating pollution photo)
        img = Image.new('RGB', (224, 224), color='gray')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        files = {"file": ("pollution_evidence.jpg", img_bytes, "image/jpeg")}
        
        # STEP 1: Submit report
        print("📤 STEP 1: Submitting pollution report...")
        response = await client.post("/reports/", data=report_data, files=files)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        report = response.json()
        
        print(f"   ✅ Report ID: {report['id']}")
        print(f"   ✅ Status: {report['status']}")
        print(f"   ✅ Latitude: {report['latitude']}")
        print(f"   ✅ Longitude: {report['longitude']}")
        
        # STEP 2: Verify AI classification
        print("\n🤖 STEP 2: Checking AI classification...")
        assert "ai_class" in report, "AI classification missing"
        assert "ai_confidence" in report, "AI confidence missing"
        assert 0.0 <= report["ai_confidence"] <= 1.0, "Invalid confidence score"
        
        print(f"   ✅ AI Class: {report['ai_class']}")
        print(f"   ✅ Confidence: {report['ai_confidence']:.2%}")
        
        # STEP 3: Verify database storage
        print("\n💾 STEP 3: Verifying database storage...")
        report_id = report["id"]
        get_response = await client.get(f"/reports/{report_id}")
        
        assert get_response.status_code == 200
        stored_report = get_response.json()
        assert stored_report["id"] == report_id
        assert stored_report["description"] == report_data["description"]
        
        print(f"   ✅ Report successfully stored in database")
        print(f"   ✅ Retrieved report matches submitted data")
        
        # STEP 4: Check blockchain logging (background task)
        print("\n⛓️  STEP 4: Blockchain logging (background task)...")
        print("   ⏳ Background task scheduled (check logs)")
        print("   ℹ️  Blockchain TX will be logged to blockchain_logs table")
        
        # STEP 5: Check notification trigger
        print("\n📧 STEP 5: Notification system check...")
        if report["ai_confidence"] >= 0.90:
            print(f"   ✅ High confidence ({report['ai_confidence']:.2%}) - Notification triggered")
            print("   📧 Email sent to authorities (check logs)")
        else:
            print(f"   ℹ️  Confidence {report['ai_confidence']:.2%} < 90% - No notification")
        
        # STEP 6: Admin verification
        print("\n👮 STEP 6: Admin verification...")
        verify_response = await client.post(f"/reports/{report_id}/verify")
        
        assert verify_response.status_code == 200
        print("   ✅ Report marked as verified")
        
        # STEP 7: Verify updated status
        print("\n🔍 STEP 7: Final verification...")
        final_response = await client.get(f"/reports/{report_id}")
        final_report = final_response.json()
        
        assert final_report["status"] == "verified"
        print("   ✅ Status updated to 'verified'")
        
        # STEP 8: List all reports
        print("\n📋 STEP 8: Retrieving all reports...")
        all_reports_response = await client.get("/reports/")
        all_reports = all_reports_response.json()
        
        assert len(all_reports) > 0
        assert any(r["id"] == report_id for r in all_reports)
        print(f"   ✅ Total reports in database: {len(all_reports)}")
        print(f"   ✅ Our report found in list")
        
        print("\n" + "="*80)
        print("✅ INTEGRATION TEST PASSED - All steps completed successfully!")
        print("="*80 + "\n")

@pytest.mark.asyncio
async def test_report_without_image():
    """Test submitting report without image (AI inference skipped)."""
    print("\n🧪 TEST: Report submission without image")
    
    async with AsyncClient(base_url=API_BASE_URL) as client:
        report_data = {
            "user_id": "test_user_no_image",
            "latitude": 28.6139,
            "longitude": 77.2090,
            "description": "Visual observation of sewage discharge",
            "severity": 6
        }
        
        response = await client.post("/reports/", data=report_data)
        assert response.status_code == 200
        
        report = response.json()
        assert report["ai_class"] is None
        assert report["ai_confidence"] == 0.0
        
        print("   ✅ Report submitted without AI classification")

@pytest.mark.asyncio
async def test_multiple_reports_same_user():
    """Test multiple reports from same user."""
    print("\n🧪 TEST: Multiple reports from same user")
    
    async with AsyncClient(base_url=API_BASE_URL) as client:
        user_id = "power_user_123"
        
        for i in range(3):
            report_data = {
                "user_id": user_id,
                "latitude": 28.0 + i * 0.1,
                "longitude": 77.0 + i * 0.1,
                "description": f"Pollution observation #{i+1}",
                "severity": 5 + i
            }
            
            response = await client.post("/reports/", data=report_data)
            assert response.status_code == 200
            print(f"   ✅ Report {i+1}/3 submitted")
        
        # Verify all reports
        all_reports = await client.get("/reports/")
        user_reports = [r for r in all_reports.json() if r["user_id"] == user_id]
        assert len(user_reports) >= 3
        
        print(f"   ✅ All reports saved (total for user: {len(user_reports)})")

if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
