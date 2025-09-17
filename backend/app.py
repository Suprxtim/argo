"""
FloatChat - Main FastAPI Application
A full-stack chat application for Argo oceanographic data analysis
"""
import logging
import asyncio
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Import local modules
from config import Config
from data_utils import get_argo_data, get_data_summary
from llm_utils import generate_llm_response, detect_query_intent
from viz_utils import create_plot, suggest_plots

# Configure logging with error handling for production environments
log_level = getattr(logging, Config.LOG_LEVEL)
log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

# Always include console logging
handlers: list = [logging.StreamHandler()]

# Try to add file logging, but don't fail if it doesn't work
try:
    if Config.LOG_FILE:
        log_dir = os.path.dirname(Config.LOG_FILE)
        if log_dir:
            os.makedirs(log_dir, exist_ok=True)
        file_handler = logging.FileHandler(Config.LOG_FILE)
        handlers.append(file_handler)
except Exception as e:
    # Log to stderr if file logging fails
    import sys
    print(f"Warning: Could not set up file logging: {e}", file=sys.stderr)

logging.basicConfig(
    level=log_level,
    format=log_format,
    handlers=handlers
)
logger = logging.getLogger(__name__)

# Validate configuration
try:
    Config.validate_config()
    logger.info("Configuration validated successfully")
except Exception as e:
    logger.error(f"Configuration validation failed: {e}")

# Initialize FastAPI app
app = FastAPI(
    title="FloatChat API",
    description="AI-powered chat interface for Argo oceanographic data analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class QueryRequest(BaseModel):
    message: str
    language: Optional[str] = "en"
    include_visualization: bool = True

class QueryResponse(BaseModel):
    text_response: str
    plot_url: Optional[str] = None
    data_summary: Optional[Dict] = None
    query_type: str
    timestamp: str
    success: bool = True
    error_message: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    data_status: str
    api_status: str

# Global variables for caching
_data_cache = None
_data_summary_cache = None

async def get_cached_data():
    """Get cached Argo data, load if not available"""
    global _data_cache
    if _data_cache is None:
        logger.info("Loading Argo data...")
        _data_cache = get_argo_data()
        if _data_cache is None:
            logger.error("Failed to load Argo data")
        else:
            logger.info(f"Loaded {len(_data_cache)} records")
    return _data_cache

async def get_cached_summary():
    """Get cached data summary"""
    global _data_summary_cache
    if _data_summary_cache is None:
        logger.info("Generating data summary...")
        _data_summary_cache = get_data_summary()
    return _data_summary_cache

@app.on_event("startup")
async def startup_event():
    """Initialize data on startup"""
    logger.info("FloatChat API starting up...")
    
    # Load data in background
    asyncio.create_task(get_cached_data())
    asyncio.create_task(get_cached_summary())
    
    logger.info("FloatChat API startup complete")

@app.get("/", response_model=Dict)
async def root():
    """Root endpoint with API information"""
    return {
        "name": "FloatChat API",
        "version": "1.0.0",
        "description": "AI-powered chat interface for Argo oceanographic data analysis",
        "endpoints": {
            "query": "/query",
            "health": "/health",
            "data_summary": "/data/summary",
            "docs": "/docs"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    
    # Check data availability
    data = await get_cached_data()
    data_status = "available" if data is not None and len(data) > 0 else "unavailable"
    
    # Check API configuration
    api_status = "configured" if Config.DEEPSEEK_API_KEY else "not_configured"
    
    overall_status = "healthy" if data_status == "available" else "degraded"
    
    return HealthResponse(
        status=overall_status,
        timestamp=datetime.now().isoformat(),
        data_status=data_status,
        api_status=api_status
    )

@app.get("/data/summary", response_model=Dict)
async def get_data_summary_endpoint():
    """Get summary statistics of the Argo dataset"""
    try:
        summary = await get_cached_summary()
        if not summary:
            raise HTTPException(status_code=503, detail="Data summary not available")
        
        return {
            "success": True,
            "summary": summary,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error getting data summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """
    Main query endpoint - processes user queries and returns text response with optional visualization
    """
    try:
        logger.info(f"Processing query: {request.message[:100]}...")
        
        # Detect query intent and extract parameters
        query_type, parameters = detect_query_intent(request.message)
        logger.info(f"Detected query type: {query_type}, parameters: {parameters}")
        
        # Initialize response
        response = QueryResponse(
            text_response="",
            query_type=query_type,
            timestamp=datetime.now().isoformat()
        )
        
        # Get data if needed for data queries
        data = None
        data_context = ""
        
        if query_type == "data_query":
            # Load and filter data based on parameters
            data = await get_cached_data()
            
            if data is None or len(data) == 0:
                response.text_response = "I apologize, but I'm currently unable to access the Argo dataset. Please try again later."
                response.success = False
                response.error_message = "Data not available"
                return response
            
            # Apply filters from query parameters
            if parameters:
                from data_utils import argo_manager
                data = argo_manager.query_data(parameters)
            
            if data is None or len(data) == 0:
                response.text_response = "No data found matching your criteria. Please try adjusting your query parameters."
                return response
            
            # Create data context for LLM
            data_context = f"""
            Dataset contains {len(data)} measurements from {data['profile_id'].nunique()} profiles.
            Data spans from {data['date'].min()} to {data['date'].max()}.
            Depth range: {data['depth_m'].min():.1f}m to {data['depth_m'].max():.1f}m
            Temperature range: {data['temperature_c'].min():.2f}°C to {data['temperature_c'].max():.2f}°C
            Salinity range: {data['salinity_psu'].min():.2f} to {data['salinity_psu'].max():.2f} PSU
            Geographic coverage: {data['latitude'].min():.1f}° to {data['latitude'].max():.1f}° latitude, 
                               {data['longitude'].min():.1f}° to {data['longitude'].max():.1f}° longitude
            """
        
        # Generate LLM response
        try:
            if query_type == "data_query":
                llm_response_type = "data_analysis"
            elif query_type == "greeting":
                llm_response_type = "greeting"
            else:
                llm_response_type = "explanation"
            
            response.text_response = await generate_llm_response(
                request.message, 
                data_context, 
                llm_response_type
            )
            
        except Exception as e:
            logger.error(f"Error generating LLM response: {e}")
            response.text_response = "I encountered an issue generating a detailed response, but I can still help with your oceanographic data analysis."
        
        # Create visualization if requested and data is available
        if request.include_visualization and data is not None and len(data) > 0:
            try:
                logger.info(f"Creating visualization for query: {request.message}")
                logger.info(f"Data shape: {data.shape}")
                logger.info(f"Data columns: {list(data.columns)}")
                # Suggest appropriate visualizations
                suggested_plots = suggest_plots(data, request.message)
                logger.info(f"Suggested plots: {suggested_plots}")
                logger.info(f"Suggested plots type: {type(suggested_plots)}")
                
                if suggested_plots:
                    # Create the first suggested plot
                    plot_type = suggested_plots[0]
                    logger.info(f"Creating plot of type: {plot_type}")
                    
                    # Log the data shape
                    logger.info(f"Data shape: {data.shape}")
                    logger.info(f"Data columns: {list(data.columns)}")
                    
                    # Create visualization with proper parameters based on plot type
                    # Functions that DON'T need 'variable' parameter
                    if plot_type in ['temperature_depth_profile', 'depth_distribution', 'correlation_heatmap', '3d_scatter', 'ts_diagram']:
                        logger.info("Creating plot without variable parameter")
                        plot_url = create_plot(
                            data, 
                            plot_type,
                            title=f"Visualization for: {request.message[:50]}..."
                        )
                    # Functions that DO need 'variable' parameter  
                    elif plot_type in ['geographic_map', 'time_series', 'regional_comparison']:
                        logger.info("Creating plot with variable parameter")
                        variable = parameters.get('variable', 'temperature_c')
                        if variable not in data.columns:
                            variable = 'temperature_c'
                        plot_url = create_plot(
                            data, 
                            plot_type,
                            variable=variable,
                            title=f"Visualization for: {request.message[:50]}..."
                        )
                    else:
                        # Default handling for unknown plot types
                        logger.info("Creating plot with default handling")
                        plot_url = create_plot(
                            data, 
                            plot_type,
                            title=f"Visualization for: {request.message[:50]}..."
                        )
                    
                    logger.info(f"Plot URL result: {plot_url}")
                    if plot_url:
                        # Check if plot_url is an HTML string (contains HTML tags) or a file path
                        # Fixed the condition to properly detect HTML content
                        if plot_url.startswith('<html>') or plot_url.startswith('<!DOCTYPE html>') or '<div' in plot_url or 'plotly' in plot_url:
                            # It's an HTML string, encode it for safe transmission
                            import base64
                            encoded_html = base64.b64encode(plot_url.encode('utf-8')).decode('utf-8')
                            response.plot_url = f"data:text/html;base64,{encoded_html}"
                        else:
                            # It's still a file path, use the old method
                            response.plot_url = plot_url
                        logger.info(f"Created visualization: {response.plot_url}")
                        
                        # Add visualization info to response
                        response.text_response += f"\n\nI've created a {plot_type.replace('_', ' ')} visualization to help illustrate the data patterns."
                    else:
                        logger.warning(f"Failed to create visualization of type: {plot_type}")
                        logger.warning(f"Data available: {data is not None}")
                        logger.warning(f"Data length: {len(data) if data is not None else 'N/A'}")
                else:
                    logger.warning("No suggested plots returned")
                    
            except Exception as e:
                logger.error(f"Error creating visualization: {e}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
                # Don't fail the entire request if visualization fails
        
        # Add data summary for data queries
        if query_type == "data_query" and data is not None:
            response.data_summary = {
                "records_found": len(data),
                "profiles": data['profile_id'].nunique() if 'profile_id' in data.columns else 0,
                "date_range": [str(data['date'].min()), str(data['date'].max())] if 'date' in data.columns else None,
                "depth_range": [float(data['depth_m'].min()), float(data['depth_m'].max())] if 'depth_m' in data.columns else None
            }
        
        logger.info(f"Query processed successfully. Response length: {len(response.text_response)}")
        return response
        
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        return QueryResponse(
            text_response="I apologize, but I encountered an error processing your request. Please try again or rephrase your question.",
            query_type="error",
            timestamp=datetime.now().isoformat(),
            success=False,
            error_message=str(e)
        )

@app.get("/data/preview", response_model=Dict)
async def get_data_preview():
    """Get a preview of the available data"""
    try:
        data = await get_cached_data()
        
        if data is None or len(data) == 0:
            raise HTTPException(status_code=503, detail="Data not available")
        
        # Return a small sample
        preview = data.head(100).to_dict('records')
        
        return {
            "success": True,
            "preview": preview,
            "total_records": len(data),
            "columns": list(data.columns),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting data preview: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

# Mount static files directory at the end
static_path = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

if __name__ == "__main__":
    import uvicorn
    import os
    
    # Check if we're running in production
    is_production = os.getenv("ENVIRONMENT") == "production" or os.getenv("RENDER") == "true"
    
    logger.info(f"Starting FloatChat API on {Config.HOST}:{Config.PORT}")
    logger.info(f"Environment: {'Production' if is_production else 'Development'}")
    
    uvicorn.run(
        "app:app",
        host=Config.HOST,
        port=Config.PORT,
        reload=not is_production,  # Disable reload in production
        log_level=Config.LOG_LEVEL.lower()
    )
