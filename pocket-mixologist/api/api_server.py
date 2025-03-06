from fastapi import FastAPI, WebSocket, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
import asyncio
import time
import os
from pydantic import BaseModel
from typing import Dict, Optional, List
import logging
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("api_server")

# Import the agent manager
from agent_manager import agent_manager

# Define request models
class MessageRequest(BaseModel):
    session_id: str
    message: str

class ResetRequest(BaseModel):
    session_id: str

class ConversationHistoryRequest(BaseModel):
    session_id: str

class ConversationHistoryResponse(BaseModel):
    session_id: str
    messages: List[Dict]
    is_active: bool
    created_at: str
    last_activity: str

# Create FastAPI app
app = FastAPI(
    title="Pocket Mixologist API",
    description="API for the Pocket Mixologist cocktail recommendation system",
    version="1.0.0"
)

# Enable CORS with configuration from environment variables
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Start background tasks on server startup."""
    await agent_manager.start_cleanup_task()
    logger.info("API server started and cleanup task initialized")

@app.get("/", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "Pocket Mixologist API",
        "active_sessions": agent_manager.get_session_count()
    }

@app.post("/api/start-conversation", tags=["Conversation"])
async def start_conversation():
    """Start a new conversation with the cocktail agent"""
    try:
        # Create new session using the agent manager
        session_id, session = agent_manager.create_session()
        
        # Start the agent
        agent_manager.start_agent_in_session(session)
        
        # Get initial message
        initial_message = agent_manager.get_initial_message(session)
        
        return {
            "session_id": session_id,
            "initial_message": initial_message
        }
    except Exception as e:
        logger.error(f"Error starting conversation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start conversation: {str(e)}")

@app.post("/api/send-message", tags=["Conversation"])
async def send_message(data: MessageRequest):
    """Send a message to the agent and get a response"""
    try:
        session_id = data.session_id
        message = data.message
        
        # Get the session
        session = agent_manager.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found or expired")
        
        # Process the message
        result = agent_manager.process_user_message(session, message)
        
        return {
            "response": result["response"],
            "is_finished": result["is_finished"]
        }
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process message: {str(e)}")

@app.post("/api/reset-conversation", tags=["Conversation"])
async def reset_conversation(data: ResetRequest):
    """Reset a conversation"""
    try:
        success = agent_manager.delete_session(data.session_id)
        return {"success": success}
    except Exception as e:
        logger.error(f"Error resetting conversation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to reset conversation: {str(e)}")

@app.post("/api/conversation-history", tags=["Conversation"])
async def get_conversation_history(data: ConversationHistoryRequest):
    """Get the history of a conversation"""
    try:
        session = agent_manager.get_session(data.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found or expired")
        
        return ConversationHistoryResponse(
            session_id=session.session_id,
            messages=session.message_history,
            is_active=not session.is_expired(),
            created_at=session.created_at.isoformat(),
            last_activity=session.last_activity.isoformat()
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error retrieving conversation history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve conversation history: {str(e)}")

@app.get("/api/active-sessions", tags=["Admin"])
async def get_active_sessions():
    """Get information about active sessions (for admin purposes)"""
    try:
        sessions = agent_manager.get_all_sessions()
        session_info = []
        
        for session_id, session in sessions.items():
            session_info.append({
                "session_id": session_id,
                "created_at": session.created_at.isoformat(),
                "last_activity": session.last_activity.isoformat(),
                "message_count": len(session.message_history),
                "age_minutes": (datetime.now() - session.created_at).total_seconds() / 60
            })
        
        return {
            "session_count": len(sessions),
            "sessions": session_info
        }
    except Exception as e:
        logger.error(f"Error retrieving active sessions: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve active sessions: {str(e)}")

# Main entry point
if __name__ == "__main__":
    print("🍹 Starting Pocket Mixologist API...")
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host=host, port=port) 