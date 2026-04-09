from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models
from backend.auth_utils import get_current_user

router = APIRouter()

@router.get("/api/events")
async def list_events(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    events = db.query(models.Event).filter(models.Event.user_id == current_user.id).order_by(models.Event.timestamp.desc()).limit(100).all()
    
    return [{
        "id": e.id,
        "event_id": e.event_id,
        "session_id": e.session_id,
        "agent_id": e.agent_id,
        "tool_name": e.tool_name,
        "latency_ms": e.latency_ms,
        "timestamp": e.timestamp.isoformat() if e.timestamp else None,
        "status": e.status,
        "flag_rule": e.flag_rule,
        "flag_reason": e.flag_reason,
        "injection_type": e.injection_type,
        "injection_match": e.injection_match,
        "input_json": e.input_json,
        "output_json": e.output_json
    } for e in events]

@router.get("/api/sessions/{session_id}")
async def get_session_events(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    events = db.query(models.Event).filter(models.Event.session_id == session_id, models.Event.user_id == current_user.id).order_by(models.Event.timestamp.asc()).all()
    return [{
        "id": e.id,
        "event_id": e.event_id,
        "session_id": e.session_id,
        "agent_id": e.agent_id,
        "tool_name": e.tool_name,
        "latency_ms": e.latency_ms,
        "timestamp": e.timestamp.isoformat() if e.timestamp else None,
        "status": e.status,
        "flag_rule": e.flag_rule,
        "flag_reason": e.flag_reason,
        "injection_type": e.injection_type,
        "injection_match": e.injection_match,
        "input_json": e.input_json,
        "output_json": e.output_json
    } for e in events]
