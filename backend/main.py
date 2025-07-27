from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import logging
import uvicorn

# Import configuration and database
from config import settings, validate_settings
from database import get_db, init_db, test_connection

# Import routers
from routers import auth, interviews, feedback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-Powered Mock Interview Simulator API",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error", "detail": str(exc) if settings.debug else None}
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        db_status = test_connection()
        
        return {
            "status": "healthy" if db_status else "unhealthy",
            "app_name": settings.app_name,
            "version": settings.app_version,
            "database": "connected" if db_status else "disconnected"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "docs": "/docs" if settings.debug else "Documentation disabled in production",
        "health": "/health"
    }

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(interviews.router, prefix="/interviews", tags=["Interviews"])
app.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    try:
        logger.info(f"Starting {settings.app_name} v{settings.app_version}")
        
        # Validate settings
        validate_settings()
        logger.info("Configuration validated successfully")
        
        # Initialize database
        init_db()
        logger.info("Database initialized successfully")
        
        # Test database connection
        if test_connection():
            logger.info("Database connection verified")
        else:
            logger.error("Database connection failed")
            raise Exception("Database connection failed")
            
        logger.info("Application startup completed successfully")
        
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    logger.info("Application shutting down...")
    # Add any cleanup logic here
    logger.info("Application shutdown completed")

# Additional utility endpoints for development
if settings.debug:
    @app.get("/debug/config")
    async def debug_config():
        """Debug endpoint to view configuration (development only)"""
        return {
            "database_url": settings.database_url,
            "cors_origins": settings.cors_origins,
            "jwt_algorithm": settings.jwt_algorithm,
            "openrouter_configured": bool(settings.openrouter_api_key),
            "debug": settings.debug
        }
    
    @app.get("/debug/db-test")
    async def debug_db_test(db: Session = Depends(get_db)):
        """Debug endpoint to test database connection"""
        try:
            # Simple query to test connection
            result = db.execute("SELECT 1 as test").fetchone()
            return {"status": "success", "result": result[0] if result else None}
        except Exception as e:
            return {"status": "error", "error": str(e)}

# Run the application
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=settings.debug,
        log_level="info"
    )
