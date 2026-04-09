import json

def _get_string_values(obj):
    if isinstance(obj, str):
        yield obj
    elif isinstance(obj, dict):
        for v in obj.values():
            yield from _get_string_values(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from _get_string_values(v)

def run_anomaly_rules(event, history, agent_config):
    # event: dict, history: list of event dicts for the same session, agent_config: dict
    
    # Check R4: Empty output
    if event.get("output_json") is None or event.get("output_json") == "" or event.get("output_json") == {}:
        return {"status": "FLAGGED", "flag_rule": "R4", "flag_reason": "Output is empty"}

    output_str_lower = json.dumps(event.get("output_json", "")).lower()
    
    # Check R1: Hallucinated import
    # This is a basic mock of the logic, in real life you'd parse python code or look for imports
    if "import os" in output_str_lower or "import sys" in output_str_lower or "import subprocess" in output_str_lower:
        # Example of non-allowlisted package
        return {"status": "FLAGGED", "flag_rule": "R1", "flag_reason": "Output contains suspicious python import"}

    # Check R2: Out-of-scope file edit
    repo_scope = agent_config.get("repo_scope", "")
    if repo_scope:
        allowed_paths = [p.strip() for p in repo_scope.split(",")]
        # rough heuristic: look for file-like paths in output
        # if there's a path and it doesn't contain an allowed path
        if "/etc/" in output_str_lower or "c:\\" in output_str_lower:
            return {"status": "FLAGGED", "flag_rule": "R2", "flag_reason": "Output contains an out-of-scope file path"}

    # Check R3: Retry storm
    # Same tool_name called >3 times in session with identical input_json
    tool_name = event.get("tool_name")
    input_str = json.dumps(event.get("input_json"))
    identical_calls = 0
    for h_event in history:
        if h_event["tool_name"] == tool_name and json.dumps(h_event["input_json"]) == input_str:
            identical_calls += 1
            
    if identical_calls >= 3: # 3 past + 1 current = 4 calls total which is > 3
        return {"status": "FLAGGED", "flag_rule": "R3", "flag_reason": f"Tool '{tool_name}' called {identical_calls + 1} times with identical inputs"}

    # Check R5: Policy contradiction
    max_refund = agent_config.get("max_refund_threshold")
    if max_refund is not None:
        try:
            max_refund = float(max_refund)
            # crude check: if any output value is a dict with refund or amount that exceeds
            output_json = event.get("output_json", {})
            if isinstance(output_json, dict):
                amount = output_json.get("amount") or output_json.get("refund")
                if amount is not None and float(amount) > max_refund:
                     return {"status": "FLAGGED", "flag_rule": "R5", "flag_reason": f"Refund amount {amount} exceeds maximum allowed {max_refund}"}
        except (ValueError, TypeError):
            pass

    return None

def check_rules(event_model, agent_config, history_models):
    event_dict = {
        "tool_name": event_model.tool_name,
        "input_json": event_model.input_json if isinstance(event_model, dict) else getattr(event_model, 'input_json', None),
        "output_json": event_model.output_json if isinstance(event_model, dict) else getattr(event_model, 'output_json', None)
    }
    history = []
    for h in history_models:
        history.append({
            "tool_name": getattr(h, 'tool_name', None),
            "input_json": getattr(h, 'input_json', None),
            "output_json": getattr(h, 'output_json', None)
        })
    res = run_anomaly_rules(event_dict, history, agent_config)
    if res:
        return res.get("flag_rule"), res.get("flag_reason")
    return None, None
