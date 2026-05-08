import os
from pathlib import Path
from dotenv import load_dotenv

# Get the directory where this config.py file is located
BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"

# Load .env from the backend directory explicitly with override
def load_env():
    load_dotenv(dotenv_path=ENV_PATH, override=True)
    print("[CONFIG] ENV loaded from:", ENV_PATH)
    print("[CONFIG] ENV exists:", ENV_PATH.exists())

load_env()

class Config:
    # Environment file path
    ENV_PATH = str(ENV_PATH)

    # Read from .env file (these are evaluated at import time)
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    MAX_LOG_LINES = 1000
    SUPPORTED_FILE_TYPES = {".txt", ".log", ".csv", ".json"}

    @classmethod
    def reload(cls):
        """Reload environment variables from .env file"""
        load_dotenv(dotenv_path=ENV_PATH, override=True)
        cls.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        cls.GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        print("[CONFIG] Reloaded ENV from:", ENV_PATH)

    @classmethod
    def validate_config(cls):
        print("[CONFIG] ENV path:", cls.ENV_PATH)
        print("[CONFIG] ENV exists:", Path(cls.ENV_PATH).exists())
        print("[CONFIG] Gemini key exists:", bool(cls.GEMINI_API_KEY))

        if not cls.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is required in .env file")

        # Safe debug logging - only show last 4 characters
        key_preview = cls.GEMINI_API_KEY[-4:] if len(cls.GEMINI_API_KEY) >= 4 else "NONE"
        print("[CONFIG] Gemini key last 4:", key_preview)
        print("[CONFIG] Gemini model:", cls.GEMINI_MODEL)
