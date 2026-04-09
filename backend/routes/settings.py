from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone
from backend.database import get_db
from backend import models
from backend.auth_utils import get_current_user
import json

router = APIRouter()

@router.get("/api/metrics")
async def get_metrics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    today = datetime.now(timezone.utc).date()
    events = db.query(models.Event).filter(models.Event.user_id == current_user.id).all()
    today_events = [e for e in events if e.timestamp and e.timestamp.date() == today]
    
    total = len(today_events)
    flagged = sum(1 for e in today_events if e.status == "FLAGGED")
    injected = sum(1 for e in today_events if e.status == "INJECTED")
    avg_latency = int(sum(e.latency_ms for e in today_events) / total) if total > 0 else 0
    
    return {
        "total_events": total,
        "flagged_events": flagged,
        "injections": injected,
        "avg_latency": avg_latency
    }

@router.get("/api/settings")
async def get_settings(
    current_user: models.User = Depends(get_current_user)
):
    return json.loads(current_user.agent_config) if current_user.agent_config else {}

@router.post("/api/settings")
async def update_settings(
    config: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    current_user.agent_config = json.dumps(config)
    db.commit()
    return {"status": "ok"}
