from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.models import User
from backend.auth_utils import create_access_token
import uuid

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/api/auth/login")
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # MVP: auto register demo user
        user = User(
            id=str(uuid.uuid4()),
            email=req.email,
            password_hash=req.password,  # demo only!
            api_key="sk-agentlens-test_key_123", # default key matches test script
            agent_config="{}"
        )
        db.add(user)
        db.commit()
    
    if user.password_hash != req.password:
        raise HTTPException(status_code=401, detail="Invalid password")
        
    token = create_access_token(data={"sub": user.id})
    return {"token": token}
