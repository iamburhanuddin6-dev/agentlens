from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime

class TraceEvent(BaseModel):
    event_id: str
    session_id: str
    agent_id: str
    tool_name: str
    input_json: Any
    output_json: Any
    latency_ms: int
    timestamp: datetime
