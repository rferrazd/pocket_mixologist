"use client";

import React, { useState } from 'react';

type MessageProps = {
  content: string;
  role: 'user' | 'assistant';
  timestamp?: string;
  isNew?: boolean;
};

const Message: React.FC<MessageProps> = ({ content, role, timestamp, isNew = false }) => {
  const isUser = role === 'user';
  const [isHovered, setIsHovered] = useState(false);
  
  // Format the timestamp if provided
  const formattedTime = timestamp 
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  // Enhanced recipe detection
  const hasCocktailRecipe = 
    content.includes("## ") || 
    content.includes("Ingredients:") || 
    content.includes("Instructions:") ||
    (content.includes("oz") && content.includes("\n-"));
  
  // Parse content for enhanced recipe display
  const formatRecipe = (content: string) => {
    // Create the structure with icons and formatting
    return content
      // Format main title
      .replace(/## (.*)/g, '<div class="cocktail-title"><span class="cocktail-icon">🍹</span><h3>$1</h3></div>')
      
      // Format ingredients section with icon
      .replace(/Ingredients:/g, 
        '<div class="recipe-section"><div class="section-header">' +
        '<span class="section-icon">🥃</span><h4>Ingredients:</h4></div>' +
        '<div class="ingredients-list">')
      
      // Format instructions section with icon
      .replace(/Instructions:/g, 
        '</div></div>' + // Close ingredients section
        '<div class="recipe-section"><div class="section-header">' +
        '<span class="section-icon">📝</span><h4>Instructions:</h4></div>' +
        '<div class="instructions-list">')
      
      // Format ingredients with appropriate icons
      .replace(/\n- (.*?)(oz|cl|ml|cup|tsp|tbsp)(.*?)(rum|vodka|gin|whiskey|bourbon|tequila|brandy)(.*)/gi, 
        '<div class="ingredient-item"><span class="ingredient-icon">🥃</span>$1$2$3<span class="ingredient-highlight">$4</span>$5</div>')
      .replace(/\n- (.*?)(oz|cl|ml|cup|tsp|tbsp)(.*?)(juice|syrup|puree|nectar)(.*)/gi, 
        '<div class="ingredient-item"><span class="ingredient-icon">🧃</span>$1$2$3<span class="ingredient-highlight">$4</span>$5</div>')
      .replace(/\n- (.*?)(oz|cl|ml|cup|tsp|tbsp)(.*?)(vermouth|amaro|bitters|liqueur)(.*)/gi, 
        '<div class="ingredient-item"><span class="ingredient-icon">🍶</span>$1$2$3<span class="ingredient-highlight">$4</span>$5</div>')
      .replace(/\n- (.*?)(lime|lemon|orange|grapefruit|pineapple|apple)(.*)/gi, 
        '<div class="ingredient-item"><span class="ingredient-icon">🍋</span>$1<span class="ingredient-highlight">$2</span>$3</div>')
      .replace(/\n- (.*?)(mint|basil|rosemary|thyme|sage)(.*)/gi, 
        '<div class="ingredient-item"><span class="ingredient-icon">🌿</span>$1<span class="ingredient-highlight">$2</span>$3</div>')
      .replace(/\n- (.*?)(sugar|honey|agave|maple)(.*)/gi, 
        '<div class="ingredient-item"><span class="ingredient-icon">🍯</span>$1<span class="ingredient-highlight">$2</span>$3</div>')
      .replace(/\n- (.*?)(soda|water|ice|club soda|tonic)(.*)/gi, 
        '<div class="ingredient-item"><span class="ingredient-icon">💧</span>$1<span class="ingredient-highlight">$2</span>$3</div>')
      // Generic ingredient fallback
      .replace(/\n- (.*)/g, '<div class="ingredient-item"><span class="ingredient-icon">🍸</span>$1</div>')
      
      // Format numbered instructions with step numbers
      .replace(/\n(\d+)\. (.*)/g, '<div class="instruction-step"><span class="step-number">$1</span><span class="step-text">$2</span></div>')
      
      // Close final divs
      + '</div></div>'
      
      // Add garnish section with special icon if present
      .replace(/(Garnish:.*)/g, '<div class="garnish-section"><span class="garnish-icon">🍊</span><span class="garnish-text">$1</span></div>')
      
      // Add a glass recommendation section if present
      .replace(/(Serve in.*)/g, '<div class="glass-section"><span class="glass-icon">🥂</span><span class="glass-text">$1</span></div>')
      
      // Add notes section if present
      .replace(/(Note:.*)/g, '<div class="note-section"><span class="note-icon">📌</span><span class="note-text">$1</span></div>');
  };
  
  let formattedContent = content;
  
  // Apply enhanced formatting if this is a cocktail recipe
  if (hasCocktailRecipe && !isUser) {
    formattedContent = formatRecipe(content);
  }
    
  return (
    <div 
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-5 ${
        isNew ? 'animate-fadeIn' : ''
      }`}
    >
      {/* Avatar and bubble container */}
      <div className="flex items-end gap-2">
        {/* Avatar for assistant only */}
        {!isUser && (
          <div 
            className={`w-8 h-8 rounded-full bg-mixology-bitters/50 flex-shrink-0 flex items-center justify-center shadow-inner-glow border border-mixology-bitters/30 transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
              <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
            </svg>
          </div>
        )}
        
        {/* Message bubble */}
        <div 
          className={`relative p-4 rounded-xl max-w-[85%] backdrop-blur-sm group ${
            isUser 
              ? 'bg-mixology-whiskey text-mixology-dark rounded-tr-none border border-mixology-whiskey/50 shadow-glossy hover:shadow-lg transition-shadow' 
              : 'bg-mixology-elevated/80 text-white rounded-tl-none border border-white/10 shadow-inner-glow hover:bg-mixology-elevated/90 transition-colors'
          } ${isNew ? 'animate-messageIn' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isNew && !isUser && (
            <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-mixology-whiskey animate-ping" />
          )}
          
          {/* Shimmer effect on hover */}
          <div className={`absolute inset-0 overflow-hidden rounded-xl ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'} pointer-events-none transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="shimmer absolute inset-0"></div>
          </div>
          
          {/* Message content */}
          {hasCocktailRecipe && !isUser ? (
            <div 
              className="cocktail-recipe-container text-sm md:text-base whitespace-pre-wrap leading-relaxed relative z-10"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          ) : (
            <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed relative z-10">{content}</p>
          )}
        </div>
        
        {/* Avatar for user only */}
        {isUser && (
          <div 
            className={`w-8 h-8 rounded-full bg-mixology-whiskey/20 flex-shrink-0 flex items-center justify-center shadow-glossy border border-mixology-whiskey/30 transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-mixology-whiskey">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Timestamp */}
      {timestamp && (
        <span 
          className={`text-xs text-white/40 mt-1 px-1 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-60'} ${isUser ? 'text-right mr-10' : 'ml-10'}`}
        >
          {formattedTime}
        </span>
      )}
    </div>
  );
};

export default Message; 