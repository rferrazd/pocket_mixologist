"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Chat from './components/Chat';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  // Show landing page first
  const [showChat, setShowChat] = useState(false);
  const router = useRouter();

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

  const handleStartClick = () => {
    setShowChat(true);
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
        {showChat ? (
          <Chat />
        ) : (
          <div className="landing-page flex flex-col items-center justify-center text-center py-12">
            <div className="welcome-icon mb-8">
              <div className="cocktail-glass-icon"></div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-semibold mb-4 text-white">
              <span className="text-mixology-whiskey">Pocket</span> Mixologist
            </h1>
            
            <p className="text-white/70 max-w-lg mx-auto text-lg mb-10 leading-relaxed">
              Your personal cocktail expert. Tell us your preferences and we'll craft the perfect drink recommendation just for you.
            </p>
            
            <button 
              onClick={handleStartClick}
              className="px-8 py-4 bg-mixology-whiskey hover:bg-mixology-whiskey/90 text-mixology-dark text-lg font-medium rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-mixology-whiskey/50 backdrop-blur-sm"
            >
              Craft Your Cocktail
            </button>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mx-auto">
              <div className="feature-card bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-mixology-whiskey/30 transition-all">
                <div className="text-3xl mb-3">🍹</div>
                <h3 className="text-white font-medium text-lg mb-2">Personalized Recommendations</h3>
                <p className="text-white/60 text-sm">Get drink suggestions tailored to your unique taste preferences</p>
              </div>
              
              <div className="feature-card bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-mixology-whiskey/30 transition-all">
                <div className="text-3xl mb-3">📝</div>
                <h3 className="text-white font-medium text-lg mb-2">Detailed Recipes</h3>
                <p className="text-white/60 text-sm">Full ingredient lists and step-by-step mixing instructions</p>
              </div>
              
              <div className="feature-card bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-mixology-whiskey/30 transition-all">
                <div className="text-3xl mb-3">💬</div>
                <h3 className="text-white font-medium text-lg mb-2">Interactive Experience</h3>
                <p className="text-white/60 text-sm">Chat naturally about what you're in the mood for</p>
              </div>
            </div>
          </div>
        )}
        
        <footer className="mt-10 text-center text-white/40 text-xs">
          <p className="mb-1">Powered by LangGraph and Next.js</p>
        </footer>
      </div>
    </main>
  );
}
