import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ; //|| 'http://localhost:8000';
console.log("THIS IS THE API_BASE_URL: ", API_BASE_URL)
export interface ApiConfig {
  configurable: {
    thread_id: string;
  };
}

export interface StartConversationResponse {
  config: ApiConfig;
  agent_response: string;
}

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  agent_response: string;
  user_response: string;
  is_finished: boolean;
}

/**
 * Starts a new conversation with the cocktail agent
 */
export async function startConversation(): Promise<StartConversationResponse> {
  try {
    console.log("TRYING TO START A CONVERSATION")
    const response = await axios.post<StartConversationResponse>(
      `${API_BASE_URL}/api/start-conversation`
    );
    return response.data;
  } catch (error) {
    console.error("Error starting conversation:", error);
    throw error;
  }
}

/**
 * Sends a message to the cocktail agent
 */
export async function sendMessage(message: string): Promise<SendMessageResponse> {
  try {
    const response = await axios.post<SendMessageResponse>(
      `${API_BASE_URL}/api/send-message`,
      { message }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
} 