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

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    # For development, you might need to adjust these imports 
    # based on where cocktail_agent.py is located
    from cocktail_agent import compile_agent, start_agent
    from langgraph.types import Command
    logger.info("Successfully imported cocktail_agent module")
except ImportError as e:
    # Absolute imports
    try:
        
        sys.path.append('/Users/robertagarcia/Desktop/learning/LangGraph/langgraph_personal/NodeInterrupt')
        # CHANGE THE LINE ABOVE TO THE FOLLOWING:
        # project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        # sys.path.append(project_root)
        
        from cocktail_agent import compile_agent, start_agent
        from langgraph.types import Command
        logger.info("Successfully imported cocktail_agent module using absolute path")
    except ImportError as e2:
        # If we can't import, raise an error - we don't want to use a mock
        logger.error(f"CRITICAL ERROR: Could not import cocktail_agent. Application cannot continue. Error: {e2}")
        raise ImportError(f"Failed to import cocktail_agent module: {e2}")


agent = compile_agent()
config = None  # Will be initialized in start_conversation

# Define request models
class MessageRequest(BaseModel):
    message: str

class ConversationHistoryResponse(BaseModel):
    session_id: str
    messages: List[Dict]
    is_active: bool
    created_at: str
    last_activity: str

# Create FastAPI app
app = FastAPI(
    title="Pocket Mixologist API",
    description="API for the Pocket Mixologist",
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


@app.post("/api/start-conversation", tags=["Conversation"])
async def start_conversation():
    """Start a new conversation with the cocktail agent"""
    global config
    try:
        config = {"configurable": {"thread_id": str(int(time.time()))}}
        
        # Start the agent
        response = start_agent(agent, config)
        state = agent.get_state(config)
        agent_response = ""
        for task in state.tasks:
            if hasattr(task, 'interrupts') and task.interrupts:
                    agent_response = task.interrupts[0].value 
                    break
            else:
                logger.warning(f"Error with interrupt when launching app. Response from start_agent ({type(response)}): \n{response}")

        return {
            "config": config,
            "agent_response": agent_response
        }
    except Exception as e:
        logger.error(f"Error starting conversation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start conversation: {str(e)}")

@app.post("/api/send-message", tags=["Conversation"])
async def send_message(data: MessageRequest):
    """Send a message to the agent and get a response"""
    global config
    try:
        is_finished = False
        agent_response = ""
        user_response = data.message
        
        state = agent.get_state(config)
        interrupt_value = None
        for task in state.tasks:
            if hasattr(task, 'interrupts') and task.interrupts:
                interrupt_value = task.interrupts[0].value
                break
                
        if interrupt_value:
            # Show the interrupt value to the user (likely a question)
            print(f"Agent asks: {interrupt_value}")
            
            # Resume graph with user input
            for event in agent.stream(Command(resume=user_response), config=config, stream_mode="values"):
                # Add debug print to see the event structure
                print(f"DEBUG - Event type: {type(event)}")
                
                # Extract the latest message from the agent 
                agent_message = event["messages"][-1]
                
                # Check message type and display appropriate information
                if agent_message.type == "ai":
                    # For AI messages, check if there are tool calls
                    if hasattr(agent_message, 'tool_calls') and agent_message.tool_calls:
                        print(f"DEBUG - tool_calls type: {type(agent_message.tool_calls)}")
                        print(f"DEBUG - tool_calls content: {agent_message.tool_calls}")
                        
                        print(f"AI USING TOOL: {agent_message.tool_calls[0]['name']}")
                        # If it's an AskHuman tool, display the question
                        if agent_message.tool_calls[0]['name'] == "AskHuman":
                            agent_response = agent_message.tool_calls[0]['args']['question']
                            print(f"QUESTION FROM AGENT: {agent_response}")
                    else:
                        # For regular AI messages with no tool calls
                        agent_response = agent_message.content
                        print(f"AI MESSAGE: {agent_response}")
                        if not(agent.get_state(config).next):
                            is_finished = True
                elif agent_message.type == "tool":
                    # For tool messages (user responses)
                    user_response = agent_message.content
                    print(f"USER RESPONSE: {user_response}")
                else:
                    # For any other type of message
                    print(f"OTHER MESSAGE TYPE: {agent_message.type}")
                
                print("======================\n\n\n")
        else:
            # No interrupt, just waiting for normal user input
            if not(agent.get_state(config).next):
                print(" \n\n ---APPLICATION HAS ENDED---")
                is_finished = True
            else:
                print('\nERROR')

        return {
            "agent_response": agent_response,
            "user_response": user_response,
            "is_finished": is_finished
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Add better debug information
        import traceback
        logger.error(f"Error processing message: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to process message: {str(e)}")
