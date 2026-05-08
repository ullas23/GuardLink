import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Read from .env file
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    MAX_LOG_LINES = 1000
    SUPPORTED_FILE_TYPES = {".txt", ".log", ".csv", ".json"}
    
    @classmethod
    def validate_config(cls):
        if not cls.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is required in .env file")
        print(f"✅ Gemini API Key loaded successfully")
        print(f"✅ Gemini Model: {cls.GEMINI_MODEL}")
