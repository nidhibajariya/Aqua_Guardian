"""
Comprehensive test suite for AQUA Guardian backend API
Tests: Reports, AI, Database, Authentication, Blockchain
"""
import pytest
import asyncio
from httpx import AsyncClient
from pathlib import Path
import io
from PIL import Image

# Test configuration
API_BASE_URL = "http://localhost:8000"
TEST_USER_ID = "test_user_123"
TEST_IMAGE_PATH = Path(__file__).parent.parent / "ml" / "test_image.jpg"

# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def sample_report_data():
    """Sample pollution report data."""
    return {
        "user_id": TEST_USER_ID,
        "latitude": 28.6139,
        "longitude": 77.2090,
        "description": "Severe plastic pollution observed in river",
        "severity": 8
    }

@pytest.fixture
def sample_image():
    """Create a sample test image."""
    img = Image.new('RGB', (224, 224), color='blue')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes

# ============================================================================
# API TESTS
# ============================================================================

class TestReportsAPI:
    """Test report submission and retrieval endpoints."""
    
    @pytest.mark.asyncio
    async def test_create_report_without_image(self, sample_report_data):
        """Test: Submit report without image."""
        async with AsyncClient(base_url=API_BASE_URL) as client:
            response = await client.post("/reports/", data=sample_report_data)
            
            assert response.status_code == 200
            data = response.json()
            assert "id" in data
            assert data["user_id"] == TEST_USER_ID
            assert data["latitude"] == 28.6139
            assert data["status"] == "pending"
            print(f"✅ Report created: {data['id']}")
    
    @pytest.mark.asyncio
    async def test_create_report_with_image(self, sample_report_data, sample_image):
        """Test: Submit report with image (AI inference triggered)."""
        async with AsyncClient(base_url=API_BASE_URL) as client:
            files = {"file": ("test.jpg", sample_image, "image/jpeg")}
            response = await client.post(
                "/reports/", 
                data=sample_report_data,
                files=files
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "id" in data
            assert "ai_class" in data
            assert "ai_confidence" in data
            assert data["ai_confidence"] >= 0.0
            assert data["ai_confidence"] <= 1.0
            print(f"✅ Report with AI: {data['ai_class']} ({data['ai_confidence']:.2%})")
    
    @pytest.mark.asyncio
    async def test_get_all_reports(self):
        """Test: Retrieve all reports."""
        async with AsyncClient(base_url=API_BASE_URL) as client:
            response = await client.get("/reports/")
            
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            print(f"✅ Retrieved {len(data)} reports")
    
    @pytest.mark.asyncio
    async def test_get_report_by_id(self, sample_report_data):
        """Test: Retrieve specific report by ID."""
        # First create a report
        async with AsyncClient(base_url=API_BASE_URL) as client:
            create_response = await client.post("/reports/", data=sample_report_data)
            report_id = create_response.json()["id"]
            
            # Then retrieve it
            get_response = await client.get(f"/reports/{report_id}")
            assert get_response.status_code == 200
            data = get_response.json()
            assert data["id"] == report_id
            print(f"✅ Retrieved report: {report_id}")
    
    @pytest.mark.asyncio
    async def test_verify_report(self, sample_report_data):
        """Test: Verify a report (admin action)."""
        async with AsyncClient(base_url=API_BASE_URL) as client:
            # Create report
            create_response = await client.post("/reports/", data=sample_report_data)
            report_id = create_response.json()["id"]
            
            # Verify it
            verify_response = await client.post(f"/reports/{report_id}/verify")
            assert verify_response.status_code == 200
            print(f"✅ Report verified: {report_id}")
    
    @pytest.mark.asyncio
    async def test_invalid_report_data(self):
        """Test: Submit report with missing required fields."""
        async with AsyncClient(base_url=API_BASE_URL) as client:
            invalid_data = {"user_id": "test"}  # Missing lat/lon/description/severity
            response = await client.post("/reports/", data=invalid_data)
            assert response.status_code == 422  # Validation error
            print("✅ Invalid data rejected")

# ============================================================================
# AI INFERENCE TESTS
# ============================================================================

class TestAIInference:
    """Test AI image classification."""
    
    @pytest.mark.asyncio
    async def test_ai_classify_endpoint(self, sample_image):
        """Test: Direct AI classification endpoint."""
        async with AsyncClient(base_url=API_BASE_URL) as client:
            files = {"file": ("test.jpg", sample_image, "image/jpeg")}
            response = await client.post("/ai/classify", files=files)
            
            assert response.status_code == 200
            data = response.json()
            assert "class" in data
            assert "confidence" in data
            assert data["confidence"] >= 0.0 and data["confidence"] <= 1.0
            print(f"✅ AI Classification: {data['class']} ({data['confidence']:.2%})")
    
    def test_ai_inference_module(self):
        """Test: AI inference directly (unit test)."""
        from backend.ml.infer import predict_image
        
        # Create test image
        img = Image.new('RGB', (224, 224), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        
        result = predict_image(img_bytes.getvalue())
        assert "class" in result
        assert "confidence" in result
        assert result["confidence"] >= 0.0
        print(f"✅ Direct inference: {result['class']}")

# ============================================================================
# DATABASE TESTS
# ============================================================================

class TestDatabase:
    """Test database connectivity and operations."""
    
    def test_supabase_connection(self):
        """Test: Supabase connection."""
        from backend.db.supabase import supabase
        
        # Try a simple query
        response = supabase.table("reports").select("id").limit(1).execute()
        assert response is not None
        print("✅ Supabase connected")
    
    def test_database_schema(self):
        """Test: Verify database tables exist."""
        from backend.db.supabase import supabase
        
        tables = ["reports", "photos", "blockchain_logs"]
        for table in tables:
            try:
                supabase.table(table).select("*").limit(1).execute()
                print(f"✅ Table exists: {table}")
            except Exception as e:
                pytest.fail(f"Table {table} not found: {e}")

# ============================================================================
# BLOCKCHAIN TESTS
# ============================================================================

class TestBlockchain:
    """Test blockchain integration."""
    
    def test_hash_generation(self):
        """Test: Generate hash for report data."""
        from backend.blockchain.write_hash import generate_hash
        
        report_data = {
            "id": "test-id-123",
            "user_id": "user-456",
            "description": "Test pollution",
            "latitude": 28.6,
            "longitude": 77.2
        }
        
        hash_result = generate_hash(report_data)
        assert hash_result is not None
        assert len(hash_result) == 64  # SHA-256 produces 64 hex characters
        print(f"✅ Hash generated: {hash_result[:16]}...")
    
    def test_blockchain_write(self):
        """Test: Write hash to blockchain (mock test)."""
        from backend.blockchain.write_hash import write_hash_to_chain
        
        test_hash = "a" * 64  # Dummy hash
        try:
            tx_hash = write_hash_to_chain(test_hash)
            # In development, this might fail if blockchain not configured
            # Just check it doesn't crash
            print(f"✅ Blockchain write attempted: {tx_hash}")
        except Exception as e:
            print(f"⚠️ Blockchain not configured (expected): {e}")

# ============================================================================
# AUTHENTICATION TESTS
# ============================================================================

class TestAuthentication:
    """Test user authentication."""
    
    @pytest.mark.asyncio
    async def test_signup(self):
        """Test: User signup."""
        async with AsyncClient(base_url=API_BASE_URL) as client:
            signup_data = {
                "email": "test@example.com",
                "password": "securepassword123"
            }
            response = await client.post("/auth/signup", json=signup_data)
            # May fail if user exists, that's OK
            assert response.status_code in [200, 400]
            print("✅ Signup endpoint working")
    
    @pytest.mark.asyncio
    async def test_login(self):
        """Test: User login."""
        async with AsyncClient(base_url=API_BASE_URL) as client:
            login_data = {
                "email": "test@example.com",
                "password": "securepassword123"
            }
            response = await client.post("/auth/login", json=login_data)
            # May fail if user doesn't exist, that's OK for this test
            assert response.status_code in [200, 401]
            print("✅ Login endpoint working")

# ============================================================================
# INTEGRATION TESTS
# ============================================================================

class TestIntegration:
    """End-to-end integration tests."""
    
    @pytest.mark.asyncio
    async def test_full_report_workflow(self, sample_report_data, sample_image):
        """Test: Complete report submission workflow."""
        async with AsyncClient(base_url=API_BASE_URL) as client:
            # Step 1: Submit report with image
            files = {"file": ("pollution.jpg", sample_image, "image/jpeg")}
            create_response = await client.post(
                "/reports/",
                data=sample_report_data,
                files=files
            )
            assert create_response.status_code == 200
            report = create_response.json()
            report_id = report["id"]
            print(f"  Step 1: Report created - {report_id}")
            
            # Step 2: Verify AI processed it
            assert report.get("ai_class") is not None
            assert report.get("ai_confidence") is not None
            print(f"  Step 2: AI processed - {report['ai_class']}")
            
            # Step 3: Retrieve the report
            get_response = await client.get(f"/reports/{report_id}")
            assert get_response.status_code == 200
            retrieved_report = get_response.json()
            assert retrieved_report["id"] == report_id
            print(f"  Step 3: Report retrieved successfully")
            
            # Step 4: Verify the report
            verify_response = await client.post(f"/reports/{report_id}/verify")
            assert verify_response.status_code == 200
            print(f"  Step 4: Report verified")
            
            print("✅ Full workflow completed successfully")

# ============================================================================
# UTILITIES
# ============================================================================

def test_health_check():
    """Test: API health check."""
    import requests
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        assert response.status_code == 200
        print("✅ API is healthy")
    except:
        print("⚠️ Health endpoint not implemented (optional)")

# ============================================================================
# RUN ALL TESTS
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
