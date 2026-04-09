from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    api_key = Column(String, unique=True)
    agent_config = Column(Text, default="{}") # JSON string containing agent_id, repo_scope, max_refund_threshold
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Event(Base):
    __tablename__ = "events"
    
    id = Column(String, primary_key=True) # event_id from SDK
    session_id = Column(String, index=True)
    agent_id = Column(String, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    tool_name = Column(String)
    input_json = Column(Text) # JSON string
    output_json = Column(Text) # JSON string
    latency_ms = Column(Integer)
    timestamp = Column(DateTime(timezone=True))
    status = Column(String) # OK, FLAGGED, INJECTED
    flag_rule = Column(String, nullable=True) # R1-R5
    flag_reason = Column(Text, nullable=True)
    injection_type = Column(String, nullable=True)
    injection_match = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
