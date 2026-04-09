import sys
import os

# Add the project root to the path so relative imports from `backend` work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.main import app
