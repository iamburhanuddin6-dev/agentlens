import json
import re

INJECTION_PHRASES = [
    "ignore previous instructions", "disregard your system prompt", "forget everything", "your new instructions are",
    "you are now", "act as", "pretend you are", "you must respond as",
    "dan mode", "jailbreak", "developer mode"
]

DELIMITER_PATTERN = re.compile(r"(######|---SYSTEM---|\[INST\]|<\|im_start\|>)")

def detect_prompt_injection(event):
    input_json = event.get("input_json", {})
    input_str = json.dumps(input_json).lower()
    
    # 1 & 2 & 4: Keyword matching
    for phrase in INJECTION_PHRASES:
        if phrase in input_str:
            # Determine type
            if phrase in ["ignore previous instructions", "disregard your system prompt", "forget everything", "your new instructions are"]:
                type_name = "Instruction Override"
            elif phrase in ["you are now", "act as", "pretend you are", "you must respond as"]:
                type_name = "Role Impersonation"
            else:
                type_name = "Jailbreak Keyword"
                
            return {
                "status": "INJECTED",
                "injection_type": type_name,
                "injection_match": phrase
            }
            
    # 3: Delimiter Injection
    match = DELIMITER_PATTERN.search(input_str)
    if match:
        return {
            "status": "INJECTED",
            "injection_type": "Delimiter Injection",
            "injection_match": match.group(0)
        }
        
    return None

def check_injection(input_json):
    res = detect_prompt_injection({"input_json": input_json})
    if res:
        return res.get("injection_type"), res.get("injection_match")
    return None, None
