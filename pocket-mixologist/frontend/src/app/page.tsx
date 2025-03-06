"use client";

import { useEffect, useState } from 'react';
import Chat from './components/Chat';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Create initial bubbles
    for (let i = 0; i < 15; i++) {
      createBubble();
    }
    
    // Set interval to create bubbles periodically
    const interval = setInterval(createBubble, 3000);
    return () => clearInterval(interval);
  }, []);
  
  const createBubble = () => {
    const bubble = document.createElement('div');
    
    // Add bubble styling
    bubble.className = 'cocktail-bubble';
    
    // Random size
    const size = Math.random() * 60 + 20;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    
    // Random position
    bubble.style.left = `${Math.random() * 100}vw`;
    bubble.style.bottom = `-${size}px`;
    
    // Random animation duration
    const duration = Math.random() * 15 + 10;
    bubble.style.animationDuration = `${duration}s`;
    
    // Random delay
    const delay = Math.random() * 5;
    bubble.style.animationDelay = `${delay}s`;
    
    // Random bubble type (cocktail glass, shaker, bottle, etc.)
    const bubbleTypes = ['🍸', '🍹', '🥃', '🍶', '🥂', '🍷', '🧊', '🍋', '🍊'];
    const bubbleType = bubbleTypes[Math.floor(Math.random() * bubbleTypes.length)];
    
    // Create inner content with emoji
    const inner = document.createElement('span');
    inner.className = 'bubble-content';
    inner.textContent = bubbleType;
    inner.style.fontSize = `${size * 0.5}px`;
    bubble.appendChild(inner);
    
    // Add to document
    document.getElementById('bubble-container')?.appendChild(bubble);
    
    // Remove after animation completes
    setTimeout(() => {
      bubble.remove();
    }, (duration + delay) * 1000);
  };
  
  if (!mounted) return null;
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center overflow-hidden relative bg-mixology-dark">
      {/* Backdrop with animated texture */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(42,42,42,0.3),rgba(18,18,18,0.8))] pointer-events-none" />
      
      {/* Animated bubble container */}
      <div id="bubble-container" className="absolute inset-0 overflow-hidden pointer-events-none" />
      
      {/* Main content */}
      <div className="w-full max-w-4xl px-4 md:px-6 py-4 md:py-8 z-10 relative">
        <header className="mb-6 text-center">
          <h1 className="text-2xl md:text-4xl font-display font-semibold mb-2 text-white">
            <span className="text-mixology-whiskey">Pocket</span> Mixologist
          </h1>
          <p className="text-white/60 max-w-md mx-auto text-sm md:text-base">
            Your personal cocktail expert. Describe your preferences and get perfectly crafted drink recommendations.
          </p>
        </header>
        
        <Chat />
        
        <footer className="mt-6 text-center text-white/40 text-xs">
          <p className="mb-1">Powered by LangGraph and Next.js</p>
        </footer>
      </div>
    </main>
  );
}
