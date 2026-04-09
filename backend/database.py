import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base

# Vercel's Serverless environment mounts root as read-only.
# We map the SQLite file to /tmp/ which is the only writable directory on AWS Lambda.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/agentlens.db")

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
