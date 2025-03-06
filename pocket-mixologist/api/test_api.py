import requests
import time
import sys

API_BASE = "http://localhost:8000"

def test_health():
    """Test the health check endpoint"""
    response = requests.get(f"{API_BASE}/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    print("✅ Health check passed")
    return data

def test_start_conversation():
    """Test starting a new conversation"""
    response = requests.post(f"{API_BASE}/api/start-conversation")
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert "initial_message" in data
    print(f"✅ Started conversation: {data['session_id']}")
    print(f"🤖 Initial message: {data['initial_message']}")
    return data

def test_send_message(session_id, message="I'd like a sweet cocktail with rum"):
    """Test sending a message to the agent"""
    response = requests.post(
        f"{API_BASE}/api/send-message",
        json={"session_id": session_id, "message": message}
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "is_finished" in data
    print(f"✅ Sent message: {message}")
    print(f"🤖 Response: {data['response']}")
    print(f"Finished: {data['is_finished']}")
    return data

def test_get_history(session_id):
    """Test getting conversation history"""
    response = requests.post(
        f"{API_BASE}/api/conversation-history",
        json={"session_id": session_id}
    )
    assert response.status_code == 200
    data = response.json()
    assert "messages" in data
    print(f"✅ Retrieved conversation history with {len(data['messages'])} messages")
    return data

def test_active_sessions():
    """Test getting active sessions"""
    response = requests.get(f"{API_BASE}/api/active-sessions")
    assert response.status_code == 200
    data = response.json()
    assert "session_count" in data
    assert "sessions" in data
    print(f"✅ Retrieved {data['session_count']} active sessions")
    return data

def test_reset_conversation(session_id):
    """Test resetting a conversation"""
    response = requests.post(
        f"{API_BASE}/api/reset-conversation",
        json={"session_id": session_id}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    print(f"✅ Reset conversation: {session_id}")
    return data

def full_test_suite():
    """Run a full test suite of the API"""
    print("🧪 Starting API test suite...")
    
    # Test health check
    health_data = test_health()
    print(f"Active sessions: {health_data.get('active_sessions', 'N/A')}")
    
    # Start a conversation
    start_data = test_start_conversation()
    session_id = start_data["session_id"]
    
    # Send a few messages
    test_send_message(session_id, "I'd like a sweet cocktail with rum")
    time.sleep(2)  # Give the API time to process
    
    test_send_message(session_id, "I'd prefer it shaken, not stirred")
    time.sleep(2)  # Give the API time to process
    
    # Get conversation history
    history_data = test_get_history(session_id)
    
    # Check active sessions
    sessions_data = test_active_sessions()
    
    # Reset the conversation
    reset_data = test_reset_conversation(session_id)
    
    print("✅ All tests passed!")

if __name__ == "__main__":
    try:
        full_test_suite()
    except Exception as e:
        print(f"❌ Test failed: {e}")
        sys.exit(1) 