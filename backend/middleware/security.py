"""
Security Middleware for Production Hardening
Implements rate limiting, input validation, and security headers.
"""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
from datetime import datetime, timedelta
import time
import re

# Rate limiting storage (in production, use Redis)
request_counts = defaultdict(lambda: {"count": 0, "reset_time": datetime.now()})

class SecurityMiddleware(BaseHTTPMiddleware):
    """Middleware for security hardening."""
    
    async def dispatch(self, request: Request, call_next):
        # Add security headers
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware to prevent abuse."""
    
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.window_seconds = 60
    
    async def dispatch(self, request: Request, call_next):
        # Get client identifier (IP address)
        client_ip = request.client.host
        
        # Skip rate limiting for health check endpoints
        if request.url.path in ["/", "/health", "/docs", "/openapi.json"]:
            return await call_next(request)
        
        # Check rate limit
        current_time = datetime.now()
        client_data = request_counts[client_ip]
        
        # Reset counter if window has passed
        if current_time >= client_data["reset_time"]:
            client_data["count"] = 0
            client_data["reset_time"] = current_time + timedelta(seconds=self.window_seconds)
        
        # Increment counter
        client_data["count"] += 1
        
        # Check if limit exceeded
        if client_data["count"] > self.requests_per_minute:
            retry_after = int((client_data["reset_time"] - current_time).total_seconds())
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Please try again in {retry_after} seconds.",
                    "retry_after": retry_after
                },
                headers={"Retry-After": str(retry_after)}
            )
        
        # Add rate limit headers
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(self.requests_per_minute - client_data["count"])
        response.headers["X-RateLimit-Reset"] = str(int(client_data["reset_time"].timestamp()))
        
        return response

def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_coordinates(latitude: float, longitude: float) -> bool:
    """Validate geographic coordinates."""
    return -90 <= latitude <= 90 and -180 <= longitude <= 180

def sanitize_input(text: str, max_length: int = 1000) -> str:
    """Sanitize user input to prevent injection attacks."""
    if not text:
        return ""
    
    # Remove potentially dangerous characters
    sanitized = text.strip()
    
    # Limit length
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    # Remove HTML tags
    sanitized = re.sub(r'<[^>]+>', '', sanitized)
    
    # Remove SQL injection patterns
    dangerous_patterns = [
        r'(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b)',
        r'(--|;|\/\*|\*\/)',
        r'(\bOR\b.*=.*\bOR\b)',
        r'(\bAND\b.*=.*\bAND\b)'
    ]
    
    for pattern in dangerous_patterns:
        sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE)
    
    return sanitized

def validate_severity(severity: int) -> bool:
    """Validate severity level (1-5)."""
    return 1 <= severity <= 5

def validate_file_upload(filename: str, max_size_mb: int = 10) -> tuple[bool, str]:
    """Validate file upload."""
    # Check file extension
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    file_ext = '.' + filename.lower().split('.')[-1] if '.' in filename else ''
    
    if file_ext not in allowed_extensions:
        return False, f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
    
    # Check filename for dangerous characters
    if re.search(r'[<>:"/\\|?*]', filename):
        return False, "Filename contains invalid characters"
    
    return True, "Valid"

class InputValidationError(Exception):
    """Custom exception for input validation errors."""
    pass
