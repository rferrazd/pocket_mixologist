"use client";

import React, { useState, useEffect, useRef } from 'react';
import MessageList, { MessageType } from './MessageList';
import MessageInput from './MessageInput';
import * as apiService from '../services/api';

const Chat = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [mixingCocktail, setMixingCocktail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animateHeader, setAnimateHeader] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
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

  // Start a new conversation when component mounts
  useEffect(() => {
    startNewConversation();
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

  // Start a new conversation
  const startNewConversation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.startConversation();
      setSessionId(data.session_id);
      
      // Add initial message from assistant
      if (data.initial_message) {
        setMessages([{
          id: '0',
          role: 'assistant',
          content: data.initial_message,
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError('Failed to connect to the cocktail assistant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send a message to the assistant
  const sendMessage = async (messageText: string) => {
    if (!sessionId || !messageText.trim()) return;
    
    // If first message, hide welcome screen
    if (showWelcome) {
      setShowWelcome(false);
    }
    
    // Check if this is likely a cocktail request
    const isMixingRequest = isCocktailRequest(messageText);
    
    // Add user message to the list
    const userMessage: MessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setLoading(true);
    
    // Show special mixing animation for cocktail requests
    if (isMixingRequest) {
      setMixingCocktail(true);
    }
    
    try {
      const data = await apiService.sendMessage(sessionId, messageText);
      
      // Add assistant's response to the list
      const assistantMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to get a response from the cocktail assistant. Please try again.');
    } finally {
      setLoading(false);
      setMixingCocktail(false);
    }
  };

  // Reset the current conversation
  const resetConversation = async () => {
    if (!sessionId) return;
    
    // Add animation classes
    const container = chatContainerRef.current;
    if (container) {
      container.classList.add('animate-fadeOut');
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setLoading(true);
    
    try {
      await apiService.resetConversation(sessionId);
      
      // Clear messages first for better UX
      setMessages([]);
      setShowWelcome(true);
      
      // Start a new conversation
      await startNewConversation();
      
      // Remove animation classes
      if (container) {
        container.classList.remove('animate-fadeOut');
        container.classList.add('animate-fadeIn');
        setTimeout(() => {
          container.classList.remove('animate-fadeIn');
        }, 500);
      }
    } catch (err) {
      console.error('Failed to reset conversation:', err);
      setError('Failed to reset the conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle welcome screen start button
  const handleStartClick = () => {
    setShowWelcome(false);
  };

  return (
    <div className="relative">
      {/* Welcome Screen */}
      {showWelcome && (
        <div className="welcome-screen bg-gradient-to-b from-mixology-surface to-mixology-dark rounded-2xl p-8 shadow-glossy border border-mixology-whiskey/20 backdrop-blur-sm text-center relative overflow-hidden">
          <div className="welcome-icon">
            <div className="cocktail-glass-icon"></div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-display font-medium mb-4 text-mixology-whiskey">
            Welcome to your Personal Mixologist
          </h2>
          
          <p className="mb-6 text-white/70 max-w-md mx-auto">
            Tell me about your preferences, and I'll craft the perfect cocktail just for you.
          </p>
          
          <button 
            onClick={handleStartClick}
            className="px-6 py-3 bg-mixology-whiskey/90 hover:bg-mixology-whiskey text-mixology-dark font-medium rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-mixology-whiskey/50"
          >
            Start Mixing
          </button>
          
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-mixology-copper/10 blur-2xl"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-mixology-whiskey/10 blur-2xl"></div>
        </div>
      )}
      
      {/* Main Chat Interface */}
      {!showWelcome && (
        <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[800px] overflow-hidden rounded-2xl bg-gradient-to-b from-mixology-surface/80 to-mixology-dark/90 backdrop-blur-sm shadow-glossy border border-white/5">
          {/* Chat header */}
          <div className={`p-4 border-b border-white/5 backdrop-blur-sm bg-black/20 ${animateHeader ? 'animate-fadeIn' : 'opacity-0'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-display text-mixology-whiskey">Mixology Session</h2>
                <p className="text-xs text-white/50">Crafting your perfect drink</p>
              </div>
              <button 
                onClick={startNewConversation} 
                className="text-xs flex items-center gap-1 py-1 px-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                New Chat
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
                placeholderOptions={isMobile ? ["What can you make with bourbon?", "I want something refreshing"] : ["What cocktail can you make with bourbon?", "I want something refreshing with citrus", "Recommend a classic cocktail"]}
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
      )}
      
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