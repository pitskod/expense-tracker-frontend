"""
Invoice analysis endpoint.
Validates JPG files up to 5MB and extracts invoice data using OpenAI Vision API.
Files are not saved - only processed in memory.
"""
import io
import json
import logging
import os
import base64
from datetime import datetime
from typing import Literal

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from PIL import Image
from openai import OpenAI

router = APIRouter()
logger = logging.getLogger(__name__)

# Maximum file size: 5 MB
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB in bytes

# Allowed file types
ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/jpg"]
ALLOWED_EXTENSIONS = [".jpg", ".jpeg"]

# Initialize OpenAI client
_openai_client = None


def get_openai_client() -> OpenAI:
    """Get or initialize OpenAI client"""
    global _openai_client
    if _openai_client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        _openai_client = OpenAI(api_key=api_key)
    return _openai_client


class InvoiceAnalysisResponse(BaseModel):
    """Response model for invoice analysis"""
    name: str
    amount: float
    currency: Literal["USD", "EUR", "PLN"] | None = None
    date: str


def validate_file(file: UploadFile) -> None:
    """Validate file format and size"""
    # Check content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only JPG files are allowed."
        )
    
    # Check file extension
    if not any(file.filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file extension. Only .jpg or .jpeg files are allowed."
        )


async def validate_file_size(file: UploadFile) -> bytes:
    """Read and validate file size"""
    contents = await file.read()
    
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed size of 5 MB. Received: {len(contents) / 1024 / 1024:.2f} MB"
        )
    
    return contents


def parse_invoice(image_bytes: bytes) -> InvoiceAnalysisResponse:
    """
    Parse invoice image to extract expense data using OpenAI Vision API.
    Returns structured data: name, amount, currency (optional), date.
    """
    try:
        # Validate and prepare image
        try:
            image = Image.open(io.BytesIO(image_bytes))
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert image to base64
            buffer = io.BytesIO()
            image.save(buffer, format='JPEG')
            image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        except Exception as e:
            logger.error(f"Failed to process image: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid image file. Please ensure the file is a valid JPG image."
            )
        
        # Use OpenAI Vision API to extract invoice data
        try:
            client = get_openai_client()
            
            # Use gpt-4o-mini for cheaper API calls
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": """Extract invoice data from this image and return ONLY a valid JSON object with these exact fields:
{
    "name": "company or merchant name (string, required)",
    "amount": 0.00 (number, required, the total amount),
    "currency": "USD" or "EUR" or "PLN" or null (string or null, optional),
    "date": "YYYY-MM-DD" (string, required, format as YYYY-MM-DD)
}

If you cannot find a value, use null for optional fields or a reasonable default (like "Invoice" for name, today's date for date). The amount must be a number. Currency should be USD, EUR, or PLN if present, otherwise null."""
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                }
                            }
                        ]
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.1,
            )
            
            # Parse JSON response
            parsed_data = json.loads(response.choices[0].message.content)
            logger.info(f"OpenAI extracted data: {parsed_data}")
            
        except Exception as e:
            logger.error(f"OpenAI API call failed: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Failed to analyze invoice image. Please try again."
            )
        
        # Validate and create response
        try:
            # Ensure required fields exist
            if "name" not in parsed_data or not parsed_data["name"]:
                parsed_data["name"] = "Invoice"
            if "amount" not in parsed_data or parsed_data["amount"] is None:
                raise ValueError("Amount is required")
            if "date" not in parsed_data or not parsed_data["date"]:
                parsed_data["date"] = datetime.now().strftime("%Y-%m-%d")
            
            # Validate currency is one of the allowed values
            if parsed_data.get("currency") not in [None, "USD", "EUR", "PLN"]:
                parsed_data["currency"] = None
            
            return InvoiceAnalysisResponse(**parsed_data)
            
        except (ValueError, KeyError) as e:
            logger.error(f"Failed to validate extracted data: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not extract required information from invoice. The image may be unclear or not contain recognizable invoice data."
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error parsing invoice: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not parse invoice image."
        )




@router.post("/analyze", response_model=InvoiceAnalysisResponse)
async def analyze_invoice(file: UploadFile = File(...)):
    """
    Analyze an invoice image and extract expense data.
    
    - Accepts JPG image files up to 5 MB
    - Validates file format and size
    - Does not save the file
    - Returns structured data: name, amount, currency (optional), date
    - Returns error if file cannot be parsed
    """
    # Validate file format
    validate_file(file)
    
    # Validate and read file
    file_contents = await validate_file_size(file)
    
    # Parse invoice
    result = parse_invoice(file_contents)
    return result
