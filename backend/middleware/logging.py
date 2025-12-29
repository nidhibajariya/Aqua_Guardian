"""
Logging Middleware for Production Monitoring
Implements structured logging and error tracking.
"""
import logging
import time
import json
from datetime import datetime
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("aqua_guardian")

class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for request/response logging."""
    
    async def dispatch(self, request: Request, call_next):
        # Start timer
        start_time = time.time()
        
        # Log request
        request_id = f"{int(time.time() * 1000)}"
        logger.info(f"[{request_id}] {request.method} {request.url.path} - Started")
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate duration
            duration = time.time() - start_time
            
            # Log response
            logger.info(
                f"[{request_id}] {request.method} {request.url.path} - "
                f"Status: {response.status_code} - Duration: {duration:.3f}s"
            )
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as e:
            # Log error
            duration = time.time() - start_time
            logger.error(
                f"[{request_id}] {request.method} {request.url.path} - "
                f"Error: {str(e)} - Duration: {duration:.3f}s\n"
                f"Traceback: {traceback.format_exc()}"
            )
            raise

def log_ml_prediction(image_name: str, prediction: dict, duration: float):
    """Log ML model predictions for monitoring."""
    logger.info(
        f"ML Prediction - Image: {image_name} - "
        f"Class: {prediction.get('class', 'unknown')} - "
        f"Confidence: {prediction.get('confidence', 0):.4f} - "
        f"Duration: {duration:.3f}s"
    )

def log_blockchain_transaction(report_id: str, tx_hash: str, success: bool):
    """Log blockchain transactions."""
    status = "SUCCESS" if success else "FAILED"
    logger.info(
        f"Blockchain Transaction - Report: {report_id} - "
        f"TxHash: {tx_hash} - Status: {status}"
    )

def log_security_event(event_type: str, details: dict):
    """Log security-related events."""
    logger.warning(
        f"Security Event - Type: {event_type} - "
        f"Details: {json.dumps(details)}"
    )

def log_database_error(operation: str, error: str):
    """Log database errors."""
    logger.error(
        f"Database Error - Operation: {operation} - "
        f"Error: {error}"
    )

def log_api_error(endpoint: str, error: Exception):
    """Log API errors with full traceback."""
    logger.error(
        f"API Error - Endpoint: {endpoint} - "
        f"Error: {str(error)}\n"
        f"Traceback: {traceback.format_exc()}"
    )

# Create logs directory if it doesn't exist
import os
os.makedirs('logs', exist_ok=True)
