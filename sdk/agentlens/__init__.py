import time
import uuid
import json
import requests
import threading
from contextvars import ContextVar
from datetime import datetime, timezone
import functools

_api_key = None
_agent_id = None
_server_url = "http://localhost:8000"
_session_id_var = ContextVar("session_id", default=None)

def init(api_key: str, agent_id: str, server_url: str = "http://localhost:8000"):
    global _api_key, _agent_id, _server_url
    _api_key = api_key
    _agent_id = agent_id
    _server_url = server_url

def set_session_id(session_id: str):
    _session_id_var.set(session_id)

def get_session_id():
    return _session_id_var.get()

def _send_event(event_data):
    try:
        headers = {
            "Authorization": f"Bearer {_api_key}",
            "Content-Type": "application/json"
        }
        resp = requests.post(f"{_server_url}/api/ingest", json=event_data, headers=headers, timeout=5)
        resp.raise_for_status()
    except Exception as e:
        # Silently fail for observability so we don't break the agent
        print(f"AgentLens warning: failed to send trace - {e}")

def trace():
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            
            # Serialize input
            try:
                input_json = json.loads(json.dumps({"args": args, "kwargs": kwargs}, default=str))
            except:
                input_json = {"args": str(args), "kwargs": str(kwargs)}
            
            result = None
            try:
                result = func(*args, **kwargs)
                try:
                    output_json = json.loads(json.dumps(result, default=str))
                except:
                    output_json = {"result": str(result)}
            except Exception as e:
                output_json = {"error": str(e)}
                raise e
            finally:
                latency_ms = int((time.time() - start_time) * 1000)
                session_id = _session_id_var.get()
                
                event_data = {
                    "event_id": str(uuid.uuid4()),
                    "session_id": session_id or str(uuid.uuid4()),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "tool_name": func.__name__,
                    "input_json": input_json,
                    "output_json": output_json,
                    "latency_ms": latency_ms,
                    "agent_id": _agent_id,
                }
                
                # Send asynchronously
                thread = threading.Thread(target=_send_event, args=(event_data,))
                thread.daemon = True
                thread.start()
                
            return result
        return wrapper
    return decorator
