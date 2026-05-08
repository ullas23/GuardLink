import uvicorn
from main import app

if __name__ == "__main__":
    print("[START] Starting GuardLink Backend...")
    uvicorn.run(app, host="localhost", port=8001)
