import json
import google.genai as genai
from typing import Dict, Any, Optional
from config import Config

class AIEngine:
    def __init__(self):
        if not Config.GEMINI_API_KEY:
            raise ValueError("Gemini API key not configured")

        # Safe debug logging - only show last 4 characters
        key_preview = Config.GEMINI_API_KEY[-4:] if len(Config.GEMINI_API_KEY) >= 4 else "****"
        print("[DEBUG] Initializing Gemini AI Engine...")
        print(f"[DEBUG] Using API Key ending in: ****{key_preview}")
        print(f"[DEBUG] Key length: {len(Config.GEMINI_API_KEY)} characters")

        self.client = genai.Client(api_key=Config.GEMINI_API_KEY)
        self.model = Config.GEMINI_MODEL
        print(f"[OK] Gemini client initialized with model: {self.model}")
    
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
  "engine": "GUARDLINK_AI_ENGINE",
  "model_provider": "GEMINI",
  "verdict": "string ('NORMAL', 'SUSPICIOUS', 'MALICIOUS')",
  "severity": "string ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')",
  "attack_family": "string (e.g., 'Brute Force Attack', 'Port Scan', 'DDoS Attack', 'SQL Injection', 'Malware Activity', 'Normal Activity')",
  "attack_type": "string (specific attack type like 'SSH Brute Force', 'Nmap Port Scan', etc.)",
  "mitre_mapping": {{
    "tactic": "string (MITRE ATT&CK tactic name)",
    "technique": "string (MITRE ATT&CK technique name)",
    "technique_id": "string (MITRE ATT&CK technique ID like T1110)"
  }},
  "confidence_score": "integer between 0 and 100",
  "why_malicious": "string (explanation of why the activity is malicious if verdict is not NORMAL)",
  "proof_of_attack": ["array of strings showing evidence of attack"],
  "affected_systems": ["array of strings listing affected systems"],
  "suspicious_indicators": {{
    "source_ips": ["array of source IP addresses"],
    "destination_ips": ["array of destination IP addresses"],
    "domains": ["array of domain names"],
    "urls": ["array of URLs"],
    "ports": ["array of port numbers"],
    "usernames": ["array of usernames"],
    "timestamps": ["array of timestamps"]
  }},
  "soc_recommendations": ["array of actionable security recommendations"],
  "limitations": ["array of limitations or caveats in the analysis"],
  "summary": "string (detailed security analysis and executive summary)"
}}

ANALYZE AND RETURN JSON ONLY:"""

        return prompt
    
    async def analyze_logs(self, log_text: str, indicators: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Send logs to Gemini for analysis"""
        try:
            print("[AI] Starting Gemini AI analysis...")
            prompt = self.create_analysis_prompt(log_text, indicators)
            
            print(f"[AI] Sending request to Gemini model: {self.model}")
            response = self.client.models.generate_content(
                model=f"models/{self.model}",
                contents=prompt
            )
            
            if not response.text:
                raise ValueError("Empty response from Gemini")
            
            print(f"[AI] Received response from Gemini (length: {len(response.text)} chars)")
            
            # Clean response to ensure it's valid JSON
            response_text = response.text.strip()
            
            # Remove any markdown code blocks if present
            if response_text.startswith('```json'):
                response_text = response_text[7:]
                print("[AI] Removed ```json prefix")
            if response_text.startswith('```'):
                response_text = response_text[3:]
                print("[AI] Removed ``` prefix")
            if response_text.endswith('```'):
                response_text = response_text[:-3]
                print("[AI] Removed ``` suffix")
            response_text = response_text.strip()
            
            # Parse JSON response
            try:
                print("[AI] Parsing JSON response...")
                result = json.loads(response_text)
                print("[AI] JSON parsing successful")
                
                # Validate required fields
                required_fields = ["engine", "model_provider", "verdict", "severity", "attack_family", "attack_type", "mitre_mapping", "confidence_score", "why_malicious", "proof_of_attack", "affected_systems", "suspicious_indicators", "soc_recommendations", "limitations", "summary"]
                for field in required_fields:
                    if field not in result:
                        print(f"[AI WARNING] Missing required field: {field}")
                
                return result
                
            except json.JSONDecodeError as e:
                print(f"[AI ERROR] JSON parsing failed: {e}")
                print(f"[AI] Raw response: {response_text[:200]}...")
                raise ValueError(f"Invalid JSON response from Gemini: {e}")
                
        except Exception as e:
            print(f"[AI ERROR] AI Engine Error: {e}")
            raise ValueError(f"Gemini AI analysis failed: {e}")
    
    
