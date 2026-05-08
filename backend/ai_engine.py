import json
import google.genai as genai
from typing import Dict, Any, Optional
from config import Config

class AIEngine:
    def __init__(self):
        if not Config.GEMINI_API_KEY:
            raise ValueError("Gemini API key not configured")
        
        print("🚀 Initializing Gemini AI Engine...")
        self.client = genai.Client(api_key=Config.GEMINI_API_KEY)
        self.model = Config.GEMINI_MODEL
        print(f"✅ Gemini client initialized with model: {self.model}")
        print(f"✅ API Key length: {len(Config.GEMINI_API_KEY)} characters")
    
    def create_analysis_prompt(self, log_text: str, indicators: Dict[str, Any]) -> str:
        """Create structured prompt for Gemini analysis"""
        
        prompt = f"""You are GuardLink AI, a SOC log analysis engine.

Analyze the provided logs and return STRICT JSON ONLY.

Do not use markdown.
Do not explain outside JSON.
Do not wrap JSON in triple backticks.

LOG DATA:
{log_text}

EXTRACTED INDICATORS:
{json.dumps(indicators, indent=2)}

RESPONSE SCHEMA:
{{
  "attack_category": "string (e.g., 'Brute Force Attack', 'Port Scan', 'DDoS Attack', 'SQL Injection', 'Malware Activity', 'Normal Activity')",
  "confidence_score": "integer between 0 and 100",
  "severity": "string ('High', 'Medium', 'Low')",
  "indicators": {{
    "source_ips": ["array of source IP addresses"],
    "destination_ips": ["array of destination IP addresses"],
    "domains": ["array of domain names"],
    "urls": ["array of URLs"],
    "ports": ["array of port numbers"],
    "usernames": ["array of usernames"],
    "timestamps": ["array of timestamps"]
  }},
  "mitre_techniques": ["array of MITRE ATT&CK technique IDs and names"],
  "analysis": "detailed security analysis based on the logs",
  "recommendations": ["array of actionable security recommendations"]
}}

ANALYZE AND RETURN JSON ONLY:"""
        
        return prompt
    
    async def analyze_logs(self, log_text: str, indicators: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Send logs to Gemini for analysis"""
        try:
            print("🔍 Starting Gemini AI analysis...")
            prompt = self.create_analysis_prompt(log_text, indicators)
            
            print(f"📤 Sending request to Gemini model: {self.model}")
            response = self.client.models.generate_content(
                model=f"models/{self.model}",
                contents=prompt
            )
            
            if not response.text:
                raise ValueError("Empty response from Gemini")
            
            print(f"📥 Received response from Gemini (length: {len(response.text)} chars)")
            
            # Clean response to ensure it's valid JSON
            response_text = response.text.strip()
            
            # Remove any markdown code blocks if present
            if response_text.startswith('```json'):
                response_text = response_text[7:]
                print("🔧 Removed ```json prefix")
            if response_text.startswith('```'):
                response_text = response_text[3:]
                print("🔧 Removed ``` prefix")
            if response_text.endswith('```'):
                response_text = response_text[:-3]
                print("🔧 Removed ``` suffix")
            response_text = response_text.strip()
            
            # Parse JSON response
            try:
                print("🔍 Parsing JSON response...")
                result = json.loads(response_text)
                print("✅ JSON parsing successful")
                
                # Validate required fields
                required_fields = ["attack_category", "confidence_score", "severity", "indicators", "mitre_techniques", "analysis", "recommendations"]
                for field in required_fields:
                    if field not in result:
                        print(f"⚠️  Missing required field: {field}")
                
                return result
                
            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing failed: {e}")
                print(f"📄 Raw response: {response_text[:200]}...")
                raise ValueError(f"Invalid JSON response from Gemini: {e}")
                
        except Exception as e:
            print(f"❌ AI Engine Error: {e}")
            raise ValueError(f"Gemini AI analysis failed: {e}")
    
    
