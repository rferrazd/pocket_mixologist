import time
import logging
import asyncio
from typing import Dict, Any, Optional, List
import os
from datetime import datetime, timedelta

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    formaat='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("agent_manager")

# Import the cocktail agent functions
# We'll use a try/except to handle cases where cocktail_agent.py is not available
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    # For development, you might need to adjust these imports 
    # based on where cocktail_agent.py is located
    from cocktail_agent import compile_agent, start_agent
    from langgraph.types import Command
    MOCK_MODE = False
    logger.info("Successfully imported cocktail_agent module")
except ImportError as e:
    # Let's try an absolute import
    try:
        sys.path.append('/Users/robertagarcia/Desktop/learning/LangGraph/langgraph_personal/NodeInterrupt')
        from cocktail_agent import compile_agent, start_agent
        from langgraph.types import Command
        MOCK_MODE = False
        logger.info("Successfully imported cocktail_agent module using absolute path")
    except ImportError as e2:
        # If we can't import, raise an error - we don't want to use a mock
        logger.error(f"CRITICAL ERROR: Could not import cocktail_agent. Application cannot continue. Error: {e2}")
        raise ImportError(f"Failed to import cocktail_agent module: {e2}")
        
# No more mock implementation - we require the actual cocktail_agent

class AgentSession:
    """Represents a single agent session with its state and configuration."""
    
    def __init__(self, session_id: str, agent: Any, config: Dict[str, Any]):
        self.session_id = session_id
        self.agent = agent
        self.config = config
        self.created_at = datetime.now()
        self.last_activity = datetime.now()
        self.message_history: List[Dict[str, Any]] = []
    
    def update_activity(self):
        """Update the last activity timestamp."""
        self.last_activity = datetime.now()
    
    def is_expired(self, expiry_minutes: int = 30) -> bool:
        """Check if the session has expired based on inactivity."""
        return (datetime.now() - self.last_activity) > timedelta(minutes=expiry_minutes)
    
    def add_message(self, role: str, content: str):
        """Add a message to the history."""
        self.message_history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })


class AgentManager:
    """Manages agent sessions, creation, and cleanup."""
    
    def __init__(self):
        self.sessions: Dict[str, AgentSession] = {}
        self.cleanup_task = None
        self.expiry_minutes = 30  # Default expiry time
    
    async def start_cleanup_task(self):
        """Start the background task to clean up expired sessions."""
        if self.cleanup_task is None:
            self.cleanup_task = asyncio.create_task(self._cleanup_expired_sessions())
            logger.info("Started session cleanup task")
    
    async def _cleanup_expired_sessions(self):
        """Periodically clean up expired sessions."""
        while True:
            try:
                # Find expired sessions
                expired_sessions = [
                    session_id for session_id, session in self.sessions.items()
                    if session.is_expired(self.expiry_minutes)
                ]
                
                # Remove expired sessions
                for session_id in expired_sessions:
                    logger.info(f"Removing expired session: {session_id}")
                    del self.sessions[session_id]
                
                # Log current session count
                logger.debug(f"Active sessions: {len(self.sessions)}")
                
            except Exception as e:
                logger.error(f"Error in cleanup task: {e}")
            
            # Sleep for 5 minutes before checking again
            await asyncio.sleep(300)
    
    def create_session(self) -> tuple[str, AgentSession]:
        """Create a new agent session."""
        # Generate a unique session ID
        session_id = str(int(time.time()))
        config = {"configurable": {"thread_id": session_id}}
        
        # Create the agent
        try:
            agent = compile_agent()
            session = AgentSession(session_id, agent, config)
            self.sessions[session_id] = session
            logger.info(f"Created new session: {session_id}")
            return session_id, session
        except Exception as e:
            logger.error(f"Error creating agent: {e}")
            raise RuntimeError(f"Failed to create agent: {str(e)}")
    
    def get_session(self, session_id: str) -> Optional[AgentSession]:
        """Get a session by ID, or None if it doesn't exist."""
        session = self.sessions.get(session_id)
        if session:
            session.update_activity()
        return session
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a session by ID."""
        if session_id in self.sessions:
            del self.sessions[session_id]
            logger.info(f"Deleted session: {session_id}")
            return True
        return False
    
    def get_all_sessions(self) -> Dict[str, AgentSession]:
        """Get all active sessions."""
        return self.sessions
    
    def get_session_count(self) -> int:
        """Get the count of active sessions."""
        return len(self.sessions)
    
    def start_agent_in_session(self, session: AgentSession):
        """Initialize the agent in the given session."""
        try:
            start_agent(session.agent, session.config)
            logger.info(f"Started agent in session: {session.session_id}")
            return True
        except Exception as e:
            logger.error(f"Error starting agent in session {session.session_id}: {e}")
            raise RuntimeError(f"Failed to start agent: {str(e)}")
    
    def get_initial_message(self, session: AgentSession) -> Optional[str]:
        """Get the initial message from the agent's interrupts."""
        try:
            state = session.agent.get_state(session.config)
            
            for task in state.tasks:
                if hasattr(task, 'interrupts') and task.interrupts:
                    message = task.interrupts[0].value
                    session.add_message("assistant", message)
                    return message
            
            return None
        except Exception as e:
            logger.error(f"Error getting initial message: {e}")
            return None
    
    def process_user_message(self, session: AgentSession, message: str) -> dict:
        """Process a user message and get the agent's response."""
        try:
            # Add user message to history
            session.add_message("user", message)
            
            # Process with agent
            response = None
            is_finished = False
            
            # Stream the user input to the agent
            for event in session.agent.stream(
                Command(resume=message),
                config=session.config,
                stream_mode="values"
            ):
                agent_message = event["messages"][-1]
                
                if agent_message.type == "ai":
                    if hasattr(agent_message, 'tool_calls') and agent_message.tool_calls:
                        if agent_message.tool_calls[0]['name'] == "AskHuman":
                            response = agent_message.tool_calls[0]['args']['question']
                        else:
                            response = f"Using tool: {agent_message.tool_calls[0]['name']}"
                    else:
                        response = agent_message.content
            
            # Check if conversation is finished
            if not session.agent.get_state(session.config).next:
                is_finished = True
            
            # Add agent response to history
            if response:
                session.add_message("assistant", response)
            
            return {
                "response": response,
                "is_finished": is_finished
            }
            
        except Exception as e:
            logger.error(f"Error processing message in session {session.session_id}: {e}")
            raise RuntimeError(f"Failed to process message: {str(e)}")

# Create a singleton instance
agent_manager = AgentManager() 