"use client";

import React, { useState, useRef, useEffect } from 'react';

type MessageInputProps = {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  placeholderOptions?: string[];
};

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Tell me what kind of cocktail you\'d like...',
  placeholderOptions
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentlySent, setRecentlySent] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile devices for responsive UI adjustments
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-focus input when disabled state changes to false
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      // Add button press animation
      if (submitButtonRef.current) {
        submitButtonRef.current.classList.add('scale-95');
        setTimeout(() => {
          submitButtonRef.current?.classList.remove('scale-95');
        }, 150);
      }
      
      onSendMessage(message);
      setMessage('');
      setRecentlySent(true);
      
      // Re-focus input after sending
      setTimeout(() => {
        textareaRef.current?.focus();
        setRecentlySent(false);
      }, 100);
    }
  };
  
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-adjust height based on content
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    
    // Prevent input when disabled
    if (disabled) {
      e.preventDefault();
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    
    // Auto-adjust height based on content
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(
        Math.max(textareaRef.current.scrollHeight, 56), 
        150
      );
      textareaRef.current.style.height = `${newHeight}px`;
      textareaRef.current.focus();
    }
  };
  
  // Cocktail idea suggestions to show when input is empty
  const suggestions = placeholderOptions || [
    "What's a good rum cocktail?",
    "I'd like something refreshing with gin",
    "Can you suggest a whiskey drink?",
    "I want something non-alcoholic"
  ];
  
  // Simplified suggestions for mobile
  const mobileSuggestions = placeholderOptions || [
    "Rum cocktail?",
    "Refreshing gin drink?",
    "Whiskey recommendation?"
  ];
  
  // Use appropriate suggestions based on screen size
  const activeSuggestions = isMobile ? mobileSuggestions : suggestions;
  
  return (
    <div className="input-area border-t border-white/10 bg-mixology-elevated/50 backdrop-blur-md p-3 md:p-4">
      {!message && !disabled && (
        <div className="suggestion-chips flex flex-wrap gap-2 mb-3 transition-opacity duration-300">
          {activeSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-xs md:text-sm bg-mixology-elevated/90 hover:bg-mixology-elevated text-white/70 hover:text-white/90 px-3 py-1 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 border border-white/10"
              aria-label={`Suggestion: ${suggestion}`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div 
          className={`relative flex-1 transition-all duration-300 rounded-xl overflow-hidden border ${
            isFocused 
              ? 'border-mixology-whiskey/50 shadow-[0_0_10px_rgba(212,180,131,0.2)]' 
              : 'border-white/10'
          } ${disabled ? 'opacity-60' : 'opacity-100'}`}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={disabled ? 'Please wait...' : placeholder}
            className="w-full min-h-[56px] max-h-[150px] px-4 py-3 pr-10 bg-mixology-surface focus:ring-0 focus:outline-none placeholder-white/30 text-white resize-none scrollbar-themed"
            aria-label="Message input"
            style={{ height: '56px' }}
          />
          
          {recentlySent && (
            <span className="absolute right-3 bottom-3 text-white/20 text-xs">Sent</span>
          )}
        </div>
        
        <button
          ref={submitButtonRef}
          type="submit"
          disabled={!message.trim() || disabled}
          className={`rounded-xl p-3 flex-shrink-0 transition-all duration-300 ${
            message.trim() && !disabled
              ? 'bg-mixology-whiskey text-mixology-dark hover:bg-mixology-whiskey/90 active:scale-95' 
              : 'bg-mixology-elevated/50 text-white/30 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageInput; 