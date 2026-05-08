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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5176",
        "http://127.0.0.1:5176",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LATEST_REPORT_FILE = "latest_report.json"

indicator_extractor = None
ai_engine = None


def safe_list(value):
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def normalize_confidence(value):
    try:
        value = float(value)
        if value <= 1:
            value = value * 100
        return int(round(value))
    except Exception:
        return 0


def normalize_ai_response(result: Dict[str, Any], indicators: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ensures frontend always receives the exact field names it expects.
    """

    if not isinstance(result, dict):
        raise ValueError("AI response is not a valid JSON object")

    # Sometimes AI engine may wrap result inside another key
    if "analysis" in result and isinstance(result["analysis"], dict):
        result = result["analysis"]

    normalized = {
        "engine": result.get("engine", "GUARDLINK_AI_ENGINE"),
        "model_provider": result.get("model_provider", "GEMINI"),
        "verdict": result.get("verdict", "UNKNOWN"),
        "severity": result.get("severity", "LOW"),
        "attack_family": result.get("attack_family", "Unknown"),
        "attack_type": result.get("attack_type", "Unknown"),
        "mitre_mapping": result.get("mitre_mapping", {
            "tactic": "",
            "technique": "",
            "technique_id": ""
        }),
        "confidence_score": normalize_confidence(result.get("confidence_score", 0)),
        "why_malicious": result.get("why_malicious", ""),
        "proof_of_attack": safe_list(result.get("proof_of_attack")),
        "affected_systems": safe_list(result.get("affected_systems")),
        "suspicious_indicators": result.get("suspicious_indicators", indicators),
        "soc_recommendations": safe_list(result.get("soc_recommendations")),
        "limitations": safe_list(result.get("limitations")),
        "summary": result.get("summary", result.get("executive_summary", "")),
    }

    return normalized


def normalize_health_check_response(result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ensures frontend always receives the exact field names it expects.
    """

    if not isinstance(result, dict):
        raise ValueError("Health check response is not a valid JSON object")

    normalized = {
        "status": result.get("status", "unhealthy"),
        "service": result.get("service", "GuardLink API"),
        "version": result.get("version", "1.0.0"),
        "ai_engine_status": result.get("ai_engine_status", "lazy_not_initialized"),
        "indicator_extractor_status": result.get("indicator_extractor_status", "not_ready"),
    }

    return normalized


@app.on_event("startup")
async def startup_event():
    global indicator_extractor

    print("[START] Starting GuardLink backend...")

    try:
        Config.validate_config()
        indicator_extractor = IndicatorExtractor()
        print("[OK] Configuration loaded successfully")
        print("[OK] Indicator extractor initialized")
    except Exception as e:
        print(f"[ERROR] Startup configuration error: {e}")
        indicator_extractor = None


@app.get("/")
async def health_check():
    result = {
        "status": "healthy",
        "service": "GuardLink API",
        "version": "1.0.0",
        "ai_engine_status": "initialized" if ai_engine else "lazy_not_initialized",
        "indicator_extractor_status": "ready" if indicator_extractor else "not_ready",
    }
    return normalize_health_check_response(result)


@app.get("/api/config/status")
async def config_status():
    """Check current configuration status (safe - doesn't expose full API key)"""
    key_exists = bool(Config.GEMINI_API_KEY)
    key_preview = Config.GEMINI_API_KEY[-4:] if key_exists and len(Config.GEMINI_API_KEY) >= 4 else "N/A"

    return {
        "api_key_configured": key_exists,
        "api_key_preview": f"****{key_preview}" if key_exists else None,
        "api_key_length": len(Config.GEMINI_API_KEY) if key_exists else 0,
        "model": Config.GEMINI_MODEL,
        "env_path": Config.ENV_PATH
    }


@app.post("/api/config/reload")
async def reload_config():
    """Reload configuration from .env file"""
    global ai_engine

    try:
        # Reload Config from .env file
        Config.reload()

        # Reset AIEngine so it will be recreated with new key
        if ai_engine is not None:
            print("[RELOAD] Resetting AIEngine to use new API key...")
            ai_engine = None

        # Get key preview for response
        key_preview = Config.GEMINI_API_KEY[-4:] if Config.GEMINI_API_KEY else "NONE"

        return {
            "message": "Configuration reloaded successfully",
            "api_key_configured": bool(Config.GEMINI_API_KEY),
            "api_key_preview": f"****{key_preview}",
            "model": Config.GEMINI_MODEL
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reload config: {str(e)}")


@app.post("/api/analyze")
async def analyze_logs(
    log_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    global ai_engine

    print("\n==============================")
    print("[REQUEST] New GuardLink analysis request")
    print("==============================")

    if indicator_extractor is None:
        raise HTTPException(
            status_code=503,
            detail="Indicator extractor is not configured properly"
        )

    if not log_text and not file:
        raise HTTPException(
            status_code=400,
            detail="Either pasted log_text or uploaded file is required"
        )

    if log_text and file:
        raise HTTPException(
            status_code=400,
            detail="Provide either pasted log_text or uploaded file, not both"
        )

    try:
        if ai_engine is None:
            print("[INIT] Initializing Gemini AI engine...")
            ai_engine = AIEngine()
            print("[OK] Gemini AI engine initialized")

        if file:
            print(f"[UPLOAD] Uploaded file: {file.filename}")

            if not file.filename:
                raise HTTPException(status_code=400, detail="Invalid file name")

            file_ext = os.path.splitext(file.filename)[1].lower()

            if file_ext not in Config.SUPPORTED_FILE_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file type: {file_ext}. Supported: {', '.join(Config.SUPPORTED_FILE_TYPES)}"
                )

            file_content = await file.read()

            if len(file_content) > Config.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Maximum size: {Config.MAX_FILE_SIZE // (1024 * 1024)}MB"
                )

            log_text = file_content.decode("utf-8", errors="ignore")

        if not log_text or not log_text.strip():
            raise HTTPException(status_code=400, detail="Log content is empty")

        print(f"[DEBUG] Raw log size: {len(log_text)} characters")

        processed_logs = indicator_extractor.preprocess_logs(
            log_text,
            Config.MAX_LOG_LINES
        )

        line_count = len([line for line in processed_logs.splitlines() if line.strip()])
        print(f"[OK] Processed log lines: {line_count}")

        indicators = indicator_extractor.extract_indicators(processed_logs)
        print(f"[OK] Indicators extracted: {indicators}")

        print("[ANALYZE] Sending logs to Gemini...")
        raw_ai_result = await ai_engine.analyze_logs(processed_logs, indicators)

        if not raw_ai_result:
            raise HTTPException(status_code=500, detail="Gemini returned empty response")

        print("[OK] Gemini response received")
        print("[RAW] Raw AI result:")
        print(json.dumps(raw_ai_result, indent=2))

        analysis_result = normalize_ai_response(raw_ai_result, indicators)

        analysis_result["analysis_timestamp"] = datetime.utcnow().isoformat()
        analysis_result["log_lines_processed"] = line_count
        analysis_result["indicators_count"] = {
            key: len(value) if isinstance(value, list) else 0
            for key, value in indicators.items()
        }

        await save_latest_report(analysis_result)

        print("[OK] Normalized result sent to frontend:")
        print(json.dumps(analysis_result, indent=2))
        print("==============================\n")

        return JSONResponse(content=analysis_result)

    except HTTPException:
        raise

    except Exception as e:
        print(f"[ERROR] Analysis failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@app.get("/api/report/latest")
async def get_latest_report():
    try:
        if not os.path.exists(LATEST_REPORT_FILE):
            raise HTTPException(status_code=404, detail="No report found")

        async with aiofiles.open(LATEST_REPORT_FILE, "r", encoding="utf-8") as f:
            content = await f.read()

        return JSONResponse(content=json.loads(content))

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve report: {str(e)}"
        )


@app.post("/api/clear")
async def clear_reports():
    try:
        if os.path.exists(LATEST_REPORT_FILE):
            os.remove(LATEST_REPORT_FILE)

        return {"message": "Reports cleared successfully"}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clear reports: {str(e)}"
        )


async def save_latest_report(report: Dict[str, Any]):
    async with aiofiles.open(LATEST_REPORT_FILE, "w", encoding="utf-8") as f:
        await f.write(json.dumps(report, indent=2))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)