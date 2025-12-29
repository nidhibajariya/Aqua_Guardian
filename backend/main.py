"""
AQUA Guardian API - Main Application
Production-ready FastAPI application with security hardening.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from api import auth, reports, ai, cleanup, rewards, dashboard, blockchain, adoption
from ml.infer import get_shared_model
from middleware.logging import logger
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import middleware (create __init__.py files if needed)
try:
    from middleware.security import SecurityMiddleware, RateLimitMiddleware
    from middleware.logging import LoggingMiddleware
    MIDDLEWARE_AVAILABLE = True
except ImportError:
    logger.warning("Middleware not available. Running without security hardening.")
    MIDDLEWARE_AVAILABLE = False

# App configuration
app = FastAPI(
    title="AQUA Guardian API",
    description="AI-Powered Water Pollution Monitoring & Reporting System",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") != "production" else None
)

# CORS Configuration
# In production, use specific origins. In development, allow all.
environment = os.getenv("ENVIRONMENT", "development")
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "")

if environment == "production" and allowed_origins_str:
    # Production: Use specific allowed origins
    allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()]
else:
    # Development: Allow all origins
    allowed_origins = ["*"]

logger.info(f"CORS Configuration: Environment={environment}, Allowed Origins={allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add production middleware
if MIDDLEWARE_AVAILABLE:
    app.add_middleware(SecurityMiddleware)
    app.add_middleware(RateLimitMiddleware, requests_per_minute=60)
    app.add_middleware(LoggingMiddleware)

# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again later.",
            "path": str(request.url.path)
        }
    )

# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "service": "AQUA Guardian API",
        "version": "1.0.0"
    }


# API Routes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(reports.router, prefix="/reports", tags=["Reports"])
app.include_router(ai.router, prefix="/ai", tags=["AI Detection"])
app.include_router(cleanup.router, prefix="/cleanup", tags=["Cleanup Events"])
app.include_router(rewards.router, prefix="/rewards", tags=["Rewards & Gamification"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard & Analytics"])
app.include_router(blockchain.router, prefix="/blockchain", tags=["Blockchain"])
app.include_router(adoption.router, prefix="/adoption", tags=["Water Body Adoption"])

@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "message": "🌊 AQUA Guardian API is running",
        "version": "1.0.0",
        "description": "AI-Powered Water Pollution Monitoring & Reporting System",
        "docs": "/docs" if os.getenv("ENVIRONMENT") != "production" else "Documentation disabled in production",
        "endpoints": {
            "health": "/health",
            "auth": "/auth",
            "reports": "/reports",
            "ai": "/ai",
            "cleanup": "/cleanup",
            "rewards": "/rewards",
            "dashboard": "/dashboard"
        }
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    logger.info("=" * 60)
    logger.info("AQUA Guardian API Starting...")
    logger.info("=" * 60)
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"Security Middleware: {'Enabled' if MIDDLEWARE_AVAILABLE else 'Disabled'}")
    
    # ML Model will be lazy-loaded on first request to minimize startup delay
    # get_shared_model() 
    logger.info("ML Model pre-loading skipped to optimize startup. It will load on first report submission.")
        
    logger.info("=" * 60)

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    logger.info("AQUA Guardian API Shutting down...")
