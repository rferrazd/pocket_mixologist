"use client";

import React, { useEffect, useRef, useState } from 'react';
import Message from './Message';

export type MessageType = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
};

type MessageListProps = {
  messages: MessageType[];
  loading?: boolean;
  mixingCocktail?: boolean;
};

const MessageList: React.FC<MessageListProps> = ({ messages, loading = false, mixingCocktail = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [miniMapVisible, setMiniMapVisible] = useState(false);
  const [activeRecipeIndex, setActiveRecipeIndex] = useState<number | null>(null);
  
  // Find cocktail recipes in the conversation
  const recipeIndices = messages.reduce<number[]>((indices, message, index) => {
    if (message.role === 'assistant' && 
        (message.content.includes("## ") || 
         message.content.includes("Ingredients:") || 
         message.content.includes("Instructions:"))) {
      indices.push(index);
    }
    return indices;
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Track scroll position to show scroll button
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Show button if not at bottom (with small threshold)
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
      
      // Find which recipe is visible in the viewport (if any)
      if (recipeIndices.length > 0) {
        // This is a simple calculation - in a real app you'd calculate based on exact positions
        const scrollRatio = scrollTop / (scrollHeight - clientHeight);
        const visibleIndex = Math.floor(scrollRatio * messages.length);
        
        // Find the closest recipe index that's before the current visible position
        const currentRecipeIndex = recipeIndices.findIndex(idx => idx > visibleIndex);
        if (currentRecipeIndex > 0) {
          setActiveRecipeIndex(currentRecipeIndex - 1);
        } else if (currentRecipeIndex === 0 && visibleIndex < recipeIndices[0]) {
          setActiveRecipeIndex(null);
        } else {
          setActiveRecipeIndex(recipeIndices.length - 1);
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages, recipeIndices]);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };
  
  const scrollToMessage = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    
    // Calculate approximate position (in a real app, you'd calculate exact position)
    const scrollRatio = index / messages.length;
    const targetScrollTop = scrollRatio * (container.scrollHeight - container.clientHeight);
    container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative flex-1 flex flex-col">
      {/* Messages container */}
      <div 
        ref={containerRef}
        className="flex-1 p-4 overflow-y-auto scrollbar-themed">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-white/50 text-center">
              <div className="w-16 h-16 mx-auto mb-4 opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
                </svg>
              </div>
              <p className="text-lg mb-1 font-display">Welcome to Pocket Mixologist</p>
              <p className="text-sm">Your personal cocktail assistant is ready</p>
            </div>
          </div>
        ) : (
          <div>
            {messages.map((message, index) => (
              <Message 
                key={message.id} 
                content={message.content} 
                role={message.role} 
                timestamp={message.timestamp}
                isNew={index === messages.length - 1}
              />
            ))}
            {loading && (
              <div className="flex">
                <div className="w-8 h-8 flex-shrink-0" />
                <div className="ml-2 p-4 rounded-xl bg-mixology-elevated/80 rounded-tl-none border border-white/10 inline-block">
                  {mixingCocktail ? (
                    <div className="cocktail-loading-container">
                      <div className="cocktail-glass">
                        <div className="cocktail-liquid"></div>
                        <div className="cocktail-bubbles">
                          <div className="bubble"></div>
                          <div className="bubble"></div>
                          <div className="bubble"></div>
                          <div className="bubble"></div>
                          <div className="bubble"></div>
                        </div>
                        <div className="glass-shine"></div>
                      </div>
                      <p className="text-center text-mixology-whiskey mt-3 font-display italic">
                        Mixing your cocktail<span className="dot-1">.</span><span className="dot-2">.</span><span className="dot-3">.</span>
                      </p>
                    </div>
                  ) : (
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button 
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-mixology-whiskey text-mixology-dark flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 active:scale-95"
          aria-label="Scroll to bottom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      )}
      
      {/* Recipe navigation mini-map */}
      {recipeIndices.length > 0 && (
        <div 
          className={`absolute top-4 right-4 transition-all duration-300 ${miniMapVisible ? 'opacity-100' : 'opacity-30 hover:opacity-100'}`}
          onMouseEnter={() => setMiniMapVisible(true)}
          onMouseLeave={() => setMiniMapVisible(false)}
        >
          <button 
            onClick={() => setMiniMapVisible(!miniMapVisible)}
            className="mb-2 w-8 h-8 rounded-full bg-mixology-elevated flex items-center justify-center shadow-lg border border-white/10"
            aria-label="Toggle recipe map"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-mixology-whiskey">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
            </svg>
          </button>
          
          {miniMapVisible && (
            <div className="bg-mixology-dark/90 backdrop-blur-md p-2 rounded-lg border border-white/10 shadow-lg">
              <h4 className="text-xs text-white/70 mb-2 text-center font-serif">Cocktail Recipes</h4>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto scrollbar-themed pr-1">
                {recipeIndices.map((messageIndex, i) => {
                  const message = messages[messageIndex];
                  const title = message.content.match(/## (.*?)(\n|$)/)?.[1] || 'Recipe';
                  
                  return (
                    <button
                      key={messageIndex}
                      onClick={() => scrollToMessage(messageIndex)}
                      className={`text-xs py-1 px-2 rounded text-left truncate max-w-[120px] transition-all ${
                        i === activeRecipeIndex 
                          ? 'bg-mixology-whiskey text-mixology-dark font-medium' 
                          : 'bg-mixology-elevated hover:bg-mixology-elevated/80 text-white/80'
                      }`}
                    >
                      <span className="inline-block mr-1">🍹</span>
                      {title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageList; 