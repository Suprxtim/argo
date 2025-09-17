# FloatChat Configuration
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

class Config:
    # API Configuration
    DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
    DEEPSEEK_API_URL = os.getenv("DEEPSEEK_API_URL", "https://openrouter.ai/api/v1/chat/completions")
    
    # Server Configuration
    HOST = os.getenv("HOST", "localhost")
    PORT = int(os.getenv("PORT", 8000))
    CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "https://floatchat.onrender.com", "https://floatchat-frontend.onrender.com"]
    
    # Data Configuration - use absolute paths relative to this file
    BASE_DIR = Path(__file__).parent
    ARGO_DATA_DIR = os.getenv("ARGO_DATA_DIR") or str(BASE_DIR / "data" / "argo")
    # Always use the backend/static/plots directory regardless of environment variable
    PLOTS_DIR = str(BASE_DIR / "static" / "plots")
    
    # Logging Configuration
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE = os.getenv("LOG_FILE") or str(BASE_DIR / "logs" / "floatchat.log")
    
    # ARGO Data Sources
    ARGO_FTP_URL = "ftp://ftp.ifremer.fr/ifremer/argo"
    INCOIS_URL = "https://incois.gov.in/OON/index.jsp"
    
    @classmethod
    def validate_config(cls):
        """Validate required configuration parameters"""
        if not cls.DEEPSEEK_API_KEY:
            raise ValueError("DEEPSEEK_API_KEY is required. Please set it in .env file")
        
        # Create directories if they don't exist
        os.makedirs(cls.ARGO_DATA_DIR, exist_ok=True)
        os.makedirs(cls.PLOTS_DIR, exist_ok=True)
        os.makedirs(os.path.dirname(cls.LOG_FILE), exist_ok=True)
        
        return True