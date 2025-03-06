# Pocket Mixologist API

This is the backend API for the Pocket Mixologist cocktail recommendation application.

## Prerequisites

- Python 3.8+
- pip
- Virtual environment (recommended)

## Setup

1. Clone the repository
2. Navigate to the API folder:
   ```
   cd pocket-mixologist/api
   ```

3. Create a virtual environment:
   ```
   python -m venv venv
   ```

4. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

5. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

6. Create a .env file by copying the template:
   ```
   cp .env.example .env
   ```

7. Edit the .env file and add your OpenAI API key

## Running the API

Start the API server with:

```
python api_server.py
```

Or using uvicorn directly:

```
uvicorn api_server:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Health Check
- `GET /`: Check if the API is running, returns active session count

### Conversation Management
- `POST /api/start-conversation`: Start a new conversation, returns session ID and initial message
- `POST /api/send-message`: Send a message to the agent and get a response
- `POST /api/reset-conversation`: Reset a conversation
- `POST /api/conversation-history`: Get the full conversation history for a session

### Administration
- `GET /api/active-sessions`: Get information about all active sessions

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Advanced Features

### Session Management
The API includes automatic session management with:
- Session timeout after 30 minutes of inactivity
- Background cleanup of expired sessions
- Detailed logging of session activities

### Testing
You can test the API using the included test script:

```
python test_api.py
```

This will run through all the main API functionality and verify that everything is working correctly.

## Architecture

The API is built using FastAPI and consists of two main components:

1. **API Server** (`api_server.py`): Handles HTTP requests and responses
2. **Agent Manager** (`agent_manager.py`): Manages agent sessions, initialization, and cleanup

The Agent Manager provides:
- Session creation and tracking
- Message processing
- Conversation history
- Automatic cleanup of expired sessions 