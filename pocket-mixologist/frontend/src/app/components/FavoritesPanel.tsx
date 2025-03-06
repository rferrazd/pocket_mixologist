"use client";

import React, { useState, useEffect } from 'react';

export type FavoriteCocktail = {
  id: string;
  name: string;
  content: string;
  timestamp: string;
};

type FavoritesPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

const FavoritesPanel: React.FC<FavoritesPanelProps> = ({ isOpen, onClose }) => {
  const [favorites, setFavorites] = useState<FavoriteCocktail[]>([]);
  const [activeTab, setActiveTab] = useState<'saved' | 'history'>('saved');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('cocktail-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (err) {
        console.error('Error loading favorites:', err);
      }
    }
  }, []);
  
  // Filter favorites based on search query
  const filteredFavorites = favorites.filter(fav => 
    fav.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Remove a favorite
  const removeFavorite = (id: string) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== id);
    setFavorites(updatedFavorites);
    localStorage.setItem('cocktail-favorites', JSON.stringify(updatedFavorites));
  };
  
  // Share a cocktail recipe
  const shareCocktail = (cocktail: FavoriteCocktail) => {
    if (navigator.share) {
      navigator.share({
        title: `${cocktail.name} Recipe from Pocket Mixologist`,
        text: cocktail.content.replace(/<[^>]*>/g, ''),
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(cocktail.content.replace(/<[^>]*>/g, ''))
        .then(() => {
          alert('Recipe copied to clipboard!');
        })
        .catch(err => {
          console.error('Error copying to clipboard:', err);
        });
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="bg-mixology-surface w-full max-w-lg rounded-xl shadow-glossy border border-mixology-elevated/50 overflow-hidden animate-messageIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-mixology-elevated px-4 py-3 flex justify-between items-center border-b border-mixology-whiskey/20">
          <h2 className="text-lg font-display text-white">Your Cocktail Collection</h2>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            aria-label="Close favorites panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Tab navigation */}
        <div className="flex border-b border-mixology-elevated/50">
          <button
            className={`flex-1 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'saved' 
                ? 'text-mixology-whiskey' 
                : 'text-white/50 hover:text-white/80'
            }`}
            onClick={() => setActiveTab('saved')}
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 001.075.676L10 15.082l5.925 2.844A.75.75 0 0017 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0010 2z" clipRule="evenodd" />
              </svg>
              Saved Recipes
            </span>
            {activeTab === 'saved' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-mixology-whiskey"></div>
            )}
          </button>
          
          <button
            className={`flex-1 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'history' 
                ? 'text-mixology-whiskey' 
                : 'text-white/50 hover:text-white/80'
            }`}
            onClick={() => setActiveTab('history')}
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
              </svg>
              Recent History
            </span>
            {activeTab === 'history' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-mixology-whiskey"></div>
            )}
          </button>
        </div>
        
        {/* Search */}
        <div className="p-3 border-b border-mixology-elevated/50">
          <div className="relative">
            <input
              type="text"
              placeholder="Search your cocktails..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-mixology-elevated/50 text-white rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-1 focus:ring-mixology-whiskey/50 placeholder-white/30"
            />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white/40 absolute left-3 top-1/2 transform -translate-y-1/2">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {/* Content */}
        <div className="max-h-[50vh] overflow-y-auto p-3 space-y-3 scrollbar-themed">
          {activeTab === 'saved' && filteredFavorites.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <div className="text-4xl mb-3">🍸</div>
              <p>No saved cocktails yet.</p>
              <p className="text-sm mt-1">When you find a cocktail you love, click the save button to add it here!</p>
            </div>
          ) : (
            filteredFavorites.map(cocktail => (
              <div key={cocktail.id} className="bg-mixology-elevated/30 rounded-lg p-3 group relative border border-mixology-elevated hover:border-mixology-whiskey/30 transition-colors">
                <h3 className="text-mixology-whiskey font-medium mb-1 pr-16">{cocktail.name}</h3>
                <p className="text-white/60 text-sm line-clamp-2">{cocktail.content.replace(/<[^>]*>/g, '').substring(0, 120)}...</p>
                
                <div className="absolute top-2 right-2 flex gap-1">
                  <button 
                    onClick={() => shareCocktail(cocktail)}
                    className="p-1.5 rounded-full bg-mixology-elevated/70 text-white/60 hover:text-white hover:bg-mixology-elevated transition-colors"
                    aria-label="Share cocktail"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.475l6.733-3.366A2.52 2.52 0 0113 4.5z" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => removeFavorite(cocktail.id)}
                    className="p-1.5 rounded-full bg-mixology-elevated/70 text-white/60 hover:text-mixology-bitters hover:bg-mixology-elevated transition-colors"
                    aria-label="Remove from favorites"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
          
          {activeTab === 'history' && (
            <div className="text-center py-8 text-white/40">
              <div className="text-4xl mb-3">📜</div>
              <p>Your conversation history will appear here.</p>
              <p className="text-sm mt-1">Coming soon in a future update!</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 bg-mixology-elevated/30 border-t border-mixology-elevated/50 flex justify-between">
          <span className="text-white/40 text-xs">
            {activeTab === 'saved' ? `${filteredFavorites.length} saved cocktails` : 'Recent history'}
          </span>
          
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to clear all saved cocktails?')) {
                setFavorites([]);
                localStorage.removeItem('cocktail-favorites');
              }
            }}
            className="text-white/40 hover:text-white/70 text-xs flex items-center gap-1 transition-colors"
            disabled={filteredFavorites.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
};

export default FavoritesPanel; 