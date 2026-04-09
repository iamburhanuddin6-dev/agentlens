from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models, schemas
import json
from backend.routes.stream import broadcast_event
from backend.services.rule_engine import check_rules
from backend.services.injection import check_injection

router = APIRouter()

@router.post("/api/ingest")
async def ingest_trace(
    event: schemas.TraceEvent,
    db: Session = Depends(get_db),
    authorization: str = Header(None)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid API key")
    
    api_key = authorization.split(" ")[1]
    user = db.query(models.User).filter(models.User.api_key == api_key).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    try:
        in_json = json.dumps(event.input_json) if not isinstance(event.input_json, str) else event.input_json
        out_json = json.dumps(event.output_json) if not isinstance(event.output_json, str) else event.output_json
    except Exception:
        in_json = "{}"
        out_json = "{}"

    db_event = models.Event(
        id=event.event_id,
        session_id=event.session_id,
        agent_id=event.agent_id,
        user_id=user.id,
        tool_name=event.tool_name,
        input_json=in_json,
        output_json=out_json,
        latency_ms=event.latency_ms,
        timestamp=event.timestamp,
        status="OK" 
    )
    
    injection_type, injection_match = check_injection(event.input_json)
    if injection_type:
        db_event.status = "INJECTED"
        db_event.injection_type = injection_type
        db_event.injection_match = injection_match
        
    config_dict = {}
    if user.agent_config:
        try: config_dict = json.loads(user.agent_config)
        except: pass
        
    past_session_events = db.query(models.Event).filter(
        models.Event.session_id == event.session_id
    ).order_by(models.Event.timestamp.desc()).limit(10).all()
    
    flag_rule, flag_reason = check_rules(event, config_dict, past_session_events)
    if flag_rule:
        if db_event.status == "OK":
            db_event.status = "FLAGGED"
        db_event.flag_rule = flag_rule
        db_event.flag_reason = flag_reason
    
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    
    broadcast_event({
        "id": db_event.id,
        "event_id": db_event.id,
        "session_id": db_event.session_id,
        "agent_id": db_event.agent_id,
        "tool_name": db_event.tool_name,
        "latency_ms": db_event.latency_ms,
        "timestamp": db_event.timestamp.isoformat() if db_event.timestamp else None,
        "status": db_event.status,
        "flag_rule": db_event.flag_rule,
        "flag_reason": db_event.flag_reason,
        "injection_type": db_event.injection_type,
        "injection_match": db_event.injection_match,
        "input_json": db_event.input_json,
        "output_json": db_event.output_json
    }, user.id)
    
    return {"status": "ok"}
