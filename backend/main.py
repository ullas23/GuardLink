from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any
import json
import os
import aiofiles
from datetime import datetime

from config import Config
from ai_engine import AIEngine
from indicator_extractor import IndicatorExtractor

app = FastAPI(title="GuardLink API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5175", "http://127.0.0.1:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
try:
    Config.validate_config()
    indicator_extractor = IndicatorExtractor()
    ai_engine = None  # Initialize on demand
except Exception as e:
    print(f"Configuration error: {e}")
    ai_engine = None
    indicator_extractor = None

# File storage
LATEST_REPORT_FILE = "latest_report.json"

@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "GuardLink API",
        "version": "1.0.0",
        "ai_engine_status": "configured" if ai_engine else "not_configured"
    }

@app.post("/api/analyze")
async def analyze_logs(
    log_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """Analyze security logs using AI"""
    
    print("🚀 Starting log analysis request...")
    
    if not indicator_extractor:
        print("❌ Indicator extractor not configured")
        raise HTTPException(status_code=503, detail="Indicator extractor not properly configured")
    
    # Initialize AI engine on demand
    try:
        global ai_engine
        if ai_engine is None:
            print("🔧 Initializing AI engine...")
            ai_engine = AIEngine()
            print("✅ AI engine initialized successfully")
    except Exception as e:
        print(f"❌ AI engine initialization failed: {e}")
        raise HTTPException(status_code=503, detail=f"AI engine initialization failed: {str(e)}")
    
    # Validate input
    if not log_text and not file:
        raise HTTPException(status_code=400, detail="Either log_text or file must be provided")
    
    if log_text and file:
        raise HTTPException(status_code=400, detail="Provide either log_text or file, not both")
    
    try:
        print("📁 Processing input data...")
        
        # Handle file upload
        if file:
            print(f"📄 Processing uploaded file: {file.filename}")
            # Validate file type
            file_ext = os.path.splitext(file.filename)[1].lower()
            if file_ext not in Config.SUPPORTED_FILE_TYPES:
                print(f"❌ Unsupported file type: {file_ext}")
                raise HTTPException(
                    status_code=400, 
                    detail=f"Unsupported file type: {file_ext}. Supported types: {', '.join(Config.SUPPORTED_FILE_TYPES)}"
                )
            
            # Validate file size
            file_content = await file.read()
            if len(file_content) > Config.MAX_FILE_SIZE:
                print(f"❌ File too large: {len(file_content)} bytes")
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Maximum size: {Config.MAX_FILE_SIZE // (1024*1024)}MB"
                )
            
            log_text = file_content.decode('utf-8', errors='ignore')
            print(f"✅ File decoded successfully ({len(log_text)} characters)")
        else:
            print("📝 Processing pasted text...")
        
        # Validate log content
        if not log_text or not log_text.strip():
            print("❌ Empty log content")
            raise HTTPException(status_code=400, detail="Log content is empty")
        
        print(f"📊 Log content length: {len(log_text)} characters")
        
        # Preprocess logs
        print("🔧 Preprocessing logs...")
        processed_logs = indicator_extractor.preprocess_logs(log_text, Config.MAX_LOG_LINES)
        print(f"✅ Processed {len(processed_logs.split())} log lines")
        
        # Extract indicators
        print("🔍 Extracting indicators...")
        indicators = indicator_extractor.extract_indicators(processed_logs)
        print(f"✅ Extracted indicators: {sum(len(v) for v in indicators.values())} total")
        
        # Analyze with AI
        print("🤖 Starting AI analysis...")
        analysis_result = await ai_engine.analyze_logs(processed_logs, indicators)
        
        if not analysis_result:
            print("❌ AI analysis returned empty result")
            raise HTTPException(status_code=500, detail="AI analysis failed")
        
        print("✅ AI analysis completed successfully")
        
        # Add metadata
        analysis_result["analysis_timestamp"] = datetime.utcnow().isoformat()
        analysis_result["log_lines_processed"] = len(processed_logs.split('\n'))
        analysis_result["indicators_count"] = {
            key: len(value) for key, value in indicators.items()
        }
        
        print("💾 Saving latest report...")
        # Save latest report
        await save_latest_report(analysis_result)
        
        print("✅ Analysis request completed successfully")
        return JSONResponse(content=analysis_result)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/report/latest")
async def get_latest_report():
    """Get the latest analysis report"""
    try:
        if not os.path.exists(LATEST_REPORT_FILE):
            raise HTTPException(status_code=404, detail="No report found")
        
        async with aiofiles.open(LATEST_REPORT_FILE, 'r') as f:
            content = await f.read()
        
        return JSONResponse(content=json.loads(content))
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve report: {str(e)}")

@app.post("/api/clear")
async def clear_reports():
    """Clear the latest report"""
    try:
        if os.path.exists(LATEST_REPORT_FILE):
            os.remove(LATEST_REPORT_FILE)
        
        return {"message": "Reports cleared successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear reports: {str(e)}")

async def save_latest_report(report: Dict[str, Any]):
    """Save the latest analysis report"""
    async with aiofiles.open(LATEST_REPORT_FILE, 'w') as f:
        await f.write(json.dumps(report, indent=2))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
