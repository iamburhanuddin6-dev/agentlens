from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models
from backend.auth_utils import get_current_user
from openai import OpenAI
import os

router = APIRouter()
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "dummy"))

@router.post("/api/explain")
async def explain_anomaly(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    event_id = payload.get("event_id")
    event = db.query(models.Event).filter(models.Event.event_id == event_id, models.Event.user_id == current_user.id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if event.explanation:
        return {"explanation": event.explanation}
        
    if event.status == "OK":
        return {"explanation": "This event ran within normal limits and was not flagged."}

    flag_reason_str = event.flag_reason or event.injection_type or "Unknown anomaly"

    prompt = f"""
System: You are an AI observability assistant. You explain why an AI agent
produced an anomalous output. You only reference information from the trace
data provided. Do not invent reasons or reference anything outside the trace.
Respond in exactly 2–3 sentences of plain English. No bullet points.
User:
Agent session ID: {event.session_id}
Tool called: {event.tool_name}
Input: {event.input_json}
Output: {event.output_json}
Anomaly detected: {flag_reason_str}
Explain in plain English why this output is anomalous, citing only the
specific input or output text that caused the flag.
"""
    try:
        if client.api_key == "dummy":
            explanation = f"The tool '{event.tool_name}' triggered the rule '{flag_reason_str}'. This violates normal working boundaries based on the input payload evaluated without an actual OpenAI call due to no API key."
        else:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.0
            )
            explanation = response.choices[0].message.content.strip()
    except Exception as e:
        explanation = f"Failed to call LLM: {str(e)}"
        
    event.explanation = explanation
    db.commit()
    
    return {"explanation": explanation}
