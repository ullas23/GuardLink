import re
import json
from typing import Dict, List, Set
from datetime import datetime

class IndicatorExtractor:
    def __init__(self):
        self.ip_pattern = re.compile(r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b')
        self.domain_pattern = re.compile(r'\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b')
        self.url_pattern = re.compile(r'https?://[^\s<>"{}|\\^`[\]]')
        self.port_pattern = re.compile(r':(\d{1,5})\b')
        self.username_pattern = re.compile(r'\b(?:user|username|login|account|admin|root|guest)[\s:=]+([^\s&]+)', re.IGNORECASE)
        self.timestamp_pattern = re.compile(r'\b\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?\b')
    
    def extract_indicators(self, log_text: str) -> Dict[str, List[str]]:
        """Extract security indicators from log text"""
        indicators = {
            "source_ips": [],
            "destination_ips": [],
            "domains": [],
            "urls": [],
            "ports": [],
            "usernames": [],
            "timestamps": []
        }
        
        # Extract IPs (remove duplicates while preserving order)
        ips = list(dict.fromkeys(self.ip_pattern.findall(log_text)))
        if len(ips) > 0:
            # Simple heuristic: first half are source IPs, rest are destination IPs
            mid = len(ips) // 2
            indicators["source_ips"] = ips[:mid]
            indicators["destination_ips"] = ips[mid:] if mid > 0 else []
        
        # Extract domains
        indicators["domains"] = list(dict.fromkeys(self.domain_pattern.findall(log_text)))
        
        # Extract URLs
        indicators["urls"] = list(dict.fromkeys(self.url_pattern.findall(log_text)))
        
        # Extract ports
        ports = self.port_pattern.findall(log_text)
        indicators["ports"] = list(dict.fromkeys([int(p) for p in ports if 1 <= int(p) <= 65535]))
        
        # Extract usernames
        usernames = self.username_pattern.findall(log_text)
        indicators["usernames"] = list(dict.fromkeys(usernames))
        
        # Extract timestamps
        timestamps = self.timestamp_pattern.findall(log_text)
        indicators["timestamps"] = list(dict.fromkeys(timestamps))
        
        return indicators
    
    def preprocess_logs(self, log_text: str, max_lines: int = 1000) -> str:
        """Preprocess logs to extract relevant lines"""
        lines = log_text.strip().split('\n')
        
        # Remove empty lines and whitespace
        lines = [line.strip() for line in lines if line.strip()]
        
        # Limit to max_lines
        if len(lines) > max_lines:
            # Take first 500 and last 500 lines to get context
            if max_lines == 1000:
                lines = lines[:500] + lines[-500:]
            else:
                lines = lines[:max_lines]
        
        return '\n'.join(lines)
