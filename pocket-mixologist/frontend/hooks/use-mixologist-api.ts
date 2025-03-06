import { useState } from "react";

// Define the API base URL - should be environment variable in production
const API_BASE_URL = "http://localhost:8000";

// Types
interface StartConversationResponse {
  config: any;
  agent_response: string;
}

interface SendMessageResponse {
  agent_response: string;
  user_response: string;
  is_finished: boolean;
}

export function useMixologistApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);

  // Start a new conversation with the mixologist
  const startConversation = async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/start-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json() as StartConversationResponse;
      setConfig(data.config);
      return data.agent_response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start conversation';
      setError(errorMessage);
      console.error('Error starting conversation:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message to the mixologist
  const sendMessage = async (message: string): Promise<SendMessageResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json() as SendMessageResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startConversation,
    sendMessage,
    isLoading,
    error,
    config
  };
} 