import uvicorn
from main import app

if __name__ == "__main__":
    print("🚀 Starting GuardLink Backend...")
    uvicorn.run(app, host="localhost", port=8001)
