const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ConversationHistory {
  session_id: string;
  messages: Message[];
  is_active: boolean;
  created_at: string;
  last_activity: string;
}

// Start a new conversation
export async function startConversation(): Promise<{session_id: string, initial_message: string}> {
  const response = await fetch(`${API_BASE_URL}/start-conversation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Send a message to the assistant
export async function sendMessage(sessionId: string, message: string): Promise<{response: string}> {
  const response = await fetch(`${API_BASE_URL}/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: sessionId,
      message,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Reset a conversation
export async function resetConversation(sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/reset-conversation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: sessionId,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
}

// Get conversation history
export async function getConversationHistory(sessionId: string): Promise<ConversationHistory> {
  const response = await fetch(`${API_BASE_URL}/conversation-history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: sessionId,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Get active sessions (admin)
export async function getActiveSessions(): Promise<{count: number, sessions: Record<string, any>}> {
  const response = await fetch(`${API_BASE_URL}/active-sessions`);
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
} 