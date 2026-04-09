from fastapi import APIRouter, Depends, Request, Query, HTTPException
from fastapi.responses import StreamingResponse
import asyncio
from backend.database import get_db
from backend.auth_utils import decode_user_token
import json

router = APIRouter()

clients = []

def broadcast_event(event_dict: dict, user_id: str):
    for queue, sub_user_id in clients:
        if sub_user_id == user_id:
            queue.put_nowait(event_dict)

@router.get("/api/stream")
async def sse_stream(request: Request, token: str = Query(None), db = Depends(get_db)):
    if not token:
        raise HTTPException(status_code=401, detail="Token required")
    
    user = decode_user_token(token, db)
    queue = asyncio.Queue()
    clients.append((queue, user.id))
    
    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break
                event_data = await queue.get()
                yield f"data: {json.dumps(event_data)}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            clients.remove((queue, user.id))
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")
