"""
Unit tests for invoice analysis functionality.
"""
import io
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock
from fastapi import UploadFile, HTTPException, status
from fastapi.testclient import TestClient
from PIL import Image

from app.routers.invoices import (
    validate_file,
    validate_file_size,
    parse_invoice,
    MAX_FILE_SIZE,
)

# Path to test fixtures directory
FIXTURES_DIR = Path(__file__).parent / "fixtures"
RECEIPT_IMAGE_PATH = FIXTURES_DIR / "receipt.jpeg"

# Create fixtures directory if it doesn't exist
FIXTURES_DIR.mkdir(exist_ok=True)


def create_test_app_without_auth():
    """Create a test app instance without auth middleware"""
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from app.routers.invoices import router as invoices_router
    from contextlib import asynccontextmanager
    
    @asynccontextmanager
    async def test_lifespan(app: FastAPI):
        yield
    
    test_app = FastAPI(lifespan=test_lifespan)
    test_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    test_app.include_router(invoices_router, prefix="/api/invoices", tags=["invoices"])
    return test_app


class TestInvoiceValidation:
    """Tests for file validation"""
    
    def test_validate_file_valid_jpg(self):
        """Test validation accepts valid JPG files"""
        file = UploadFile(
            filename="test.jpg",
            file=io.BytesIO(b"fake image data"),
            headers={"content-type": "image/jpeg"}
        )
        # Should not raise
        validate_file(file)
    
    def test_validate_file_invalid_content_type(self):
        """Test validation rejects invalid content type"""
        file = UploadFile(
            filename="test.jpg",
            file=io.BytesIO(b"fake data"),
            headers={"content-type": "image/png"}
        )
        with pytest.raises(HTTPException) as exc_info:
            validate_file(file)
        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "JPG" in exc_info.value.detail
    
    def test_validate_file_invalid_extension(self):
        """Test validation rejects invalid file extension"""
        file = UploadFile(
            filename="test.png",
            file=io.BytesIO(b"fake data"),
            headers={"content-type": "image/jpeg"}
        )
        with pytest.raises(HTTPException) as exc_info:
            validate_file(file)
        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert ".jpg" in exc_info.value.detail.lower()
    
    @pytest.mark.asyncio
    async def test_validate_file_size_valid(self):
        """Test file size validation accepts files under 5MB"""
        file = UploadFile(
            filename="test.jpg",
            file=io.BytesIO(b"x" * 1024)  # 1KB
        )
        contents = await validate_file_size(file)
        assert len(contents) == 1024
    
    @pytest.mark.asyncio
    async def test_validate_file_size_too_large(self):
        """Test file size validation rejects files over 5MB"""
        large_file_data = b"x" * (MAX_FILE_SIZE + 1)
        file = UploadFile(
            filename="large.jpg",
            file=io.BytesIO(large_file_data)
        )
        with pytest.raises(HTTPException) as exc_info:
            await validate_file_size(file)
        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "5 MB" in exc_info.value.detail


class TestInvoiceAnalysisEndpoint:
    """Integration tests for the invoice analysis endpoint"""
    
    def test_analyze_invoice_endpoint_invalid_format(self):
        """Test the analyze endpoint rejects non-JPG files"""
        test_app = create_test_app_without_auth()
        client = TestClient(test_app)
        
        response = client.post(
            "/api/invoices/analyze",
            files={"file": ("test.png", b"fake png data", "image/png")}
        )
        
        assert response.status_code == 400
        assert "JPG" in response.json().get("detail", "")
    
    def test_analyze_invoice_endpoint_file_too_large(self):
        """Test the analyze endpoint rejects files larger than 5MB"""
        test_app = create_test_app_without_auth()
        client = TestClient(test_app)
        
        large_file_data = b"x" * (MAX_FILE_SIZE + 1)
        img = Image.new('RGB', (100, 100), color='white')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        response = client.post(
            "/api/invoices/analyze",
            files={"file": ("large.jpg", large_file_data, "image/jpeg")}
        )
        
        assert response.status_code == 400
        assert "5 MB" in response.json().get("detail", "")
    
    @pytest.mark.asyncio
    async def test_analyze_invoice_function_directly(self):
        """Test parse_invoice function directly with mocked OpenAI API"""
        import json
        # Create a test image
        img = Image.new('RGB', (400, 300), color='white')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        image_bytes = img_bytes.getvalue()
        
        # Mock OpenAI API response
        mock_openai_response = MagicMock()
        mock_openai_response.choices = [MagicMock()]
        mock_openai_response.choices[0].message = MagicMock()
        mock_openai_response.choices[0].message.content = json.dumps({
            "name": "Test Company",
            "amount": 100.00,
            "currency": "USD",
            "date": "2023-12-25"
        })
        
        mock_openai_client = MagicMock()
        mock_openai_client.chat.completions.create.return_value = mock_openai_response
        
        with patch('app.routers.invoices.get_openai_client', return_value=mock_openai_client):
            result = parse_invoice(image_bytes)
            
            data = result.model_dump()
            expected = {
                "name": "Test Company",
                "amount": 100.00,
                "currency": "USD",
                "date": "2023-12-25"
            }
            assert data == expected
    
    @pytest.mark.asyncio
    async def test_analyze_invoice_function_invalid_image(self):
        """Test parse_invoice handles invalid image data"""
        invalid_image_bytes = b"not an image"
        
        with pytest.raises(HTTPException) as exc_info:
            parse_invoice(invalid_image_bytes)
        assert exc_info.value.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_analyze_invoice_endpoint_success(self):
        """Test the analyze endpoint with a real image file (if available)"""
        test_app = create_test_app_without_auth()
        client = TestClient(test_app)
        
        # Check if test image exists
        if not RECEIPT_IMAGE_PATH.exists():
            pytest.skip(f"Test image not found at {RECEIPT_IMAGE_PATH}")
        
        # Read the actual image file
        with open(RECEIPT_IMAGE_PATH, 'rb') as f:
            image_data = f.read()
        
        response = client.post(
            "/api/invoices/analyze",
            files={"file": ("receipt.jpeg", image_data, "image/jpeg")}
        )
        
        assert response.status_code == 200
        
        data = response.json()
        expected = {
                "name": "Stradivarius Polska Sp. z o.o.",
                "amount": 179.9,
                "currency": "PLN",
                "date": "2025-12-21"
            }
        print(f"Actual result: {data}")
        print(f"Expected: {expected}")
        assert data == expected, f"Result mismatch. Actual: {data}, Expected: {expected}"
    

if __name__ == "__main__":
    pytest.main([__file__])
