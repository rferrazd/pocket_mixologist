"use client";

import React, { useState, useEffect, useRef } from 'react';
import MessageList, { MessageType } from './MessageList';
import MessageInput from './MessageInput';
import * as apiService from '../services/api';

const Chat = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [mixingCocktail, setMixingCocktail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animateHeader, setAnimateHeader] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Start the agent when component mounts
  useEffect(() => {
    // Start conversation when component mounts, similar to calling start_agent()
    startConversation();
    
    // Trigger header animation after a small delay
    setTimeout(() => setAnimateHeader(true), 100);
  }, []);
  
  // Detect if we're processing a cocktail request
  const isCocktailRequest = (message: string): boolean => {
    const cocktailTerms = [
      'cocktail', 'drink', 'mix', 'recipe', 'bourbon', 'whiskey', 'rum', 'vodka', 
      'gin', 'tequila', 'liquor', 'spirit', 'scotch', 'brandy', 'martini', 'margarita',
      'manhattan', 'mojito', 'daiquiri', 'negroni', 'old fashioned', 'whisky', 'beer', 'wine'
    ];
    
    return cocktailTerms.some(term => 
      message.toLowerCase().includes(term)
    );
  };

  // Start a new agent-driven conversation
  const startConversation = async () => {
    setLoading(true);
    setError(null);
    setMessages([]);
    
    try {
      // This will trigger the backend to run start_agent()
      const response = await apiService.startConversation();
      setSessionId(response.session_id);
      
      // Add the initial message from the agent to the conversation
      // This is similar to what would happen in start_agent() with "Help me build a cocktail!"
      if (response.initial_message) {
        const initialMessage: MessageType = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.initial_message,
          timestamp: new Date().toISOString()
        };
        
        setMessages([initialMessage]);
      }
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError('Failed to start your mixology session. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Send a message to the agent
  const sendMessage = async (messageText: string) => {
    if (!sessionId || !messageText.trim() || loading) return;
    
    // Create a new message object for the user's message
    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };
    
    // Detect if this is likely a cocktail request to show special loading animation
    const isCocktail = isCocktailRequest(messageText);
    
    // Update UI state
    setLoading(true);
    setMixingCocktail(isCocktail);
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    try {
      // Send the message to the API
      const response = await apiService.sendMessage(sessionId, messageText);
      
      // Create a message object for the assistant's response
      const assistantMessage: MessageType = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString()
      };
      
      // Add the assistant's response to the messages
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to get a response. Please try again.');
    } finally {
      setLoading(false);
      setMixingCocktail(false);
    }
  };
  
  // Reset the conversation to start fresh
  const resetConversation = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await apiService.resetConversation(sessionId);
      
      // Clear messages first for better UX
      setMessages([]);
      
      // Start a new conversation
      startConversation();
    } catch (err) {
      console.error('Failed to reset conversation:', err);
      setError('Failed to reset your mixology session. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Main Chat Interface */}
      <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[800px] overflow-hidden rounded-2xl bg-gradient-to-b from-mixology-surface/80 to-mixology-dark/90 backdrop-blur-sm shadow-glossy border border-white/5">
        {/* Chat header */}
        <div className={`p-4 border-b border-white/5 backdrop-blur-sm bg-black/20 ${animateHeader ? 'animate-fadeIn' : 'opacity-0'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-display text-mixology-whiskey">Mixology Session</h2>
              <p className="text-xs text-white/50">Crafting your perfect drink</p>
            </div>
            <button 
              onClick={resetConversation} 
              className="text-xs flex items-center gap-1 py-1 px-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              New Session
            </button>
          </div>
        </div>
        
        {/* Message list */}
        <div 
          ref={chatContainerRef}
          className="chat-container flex-grow overflow-y-auto custom-scrollbar p-4"
        >
          <MessageList 
            messages={messages} 
            loading={loading} 
            mixingCocktail={mixingCocktail}
          />
        </div>
        
        {/* Input area */}
        <div className="p-4 border-t border-white/5 backdrop-blur-sm bg-black/20">
          <div className="relative">
            <MessageInput 
              onSendMessage={sendMessage} 
              disabled={loading} 
              placeholder="Tell me what kind of cocktail you'd like..."
            />
            {loading && (
              <div className="absolute bottom-0 left-0 w-full flex justify-center -mb-6">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4 text-red-400 text-sm">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default Chat; 