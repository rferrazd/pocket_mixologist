"use client";

import React, { useState, useEffect } from 'react';

export type UserPreferences = {
  spirits: string[];
  flavorProfile: string[];
  alcoholContent: 'any' | 'low' | 'high' | 'non-alcoholic';
  preparationStyle: string[];
  expertMode: boolean;
  theme: 'default' | 'classic' | 'tiki' | 'modern';
};

type PreferencesPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: UserPreferences) => void;
};

const PreferencesPanel: React.FC<PreferencesPanelProps> = ({ isOpen, onClose, onSave }) => {
  // Default preferences 
  const defaultPreferences: UserPreferences = {
    spirits: [],
    flavorProfile: [],
    alcoholContent: 'any',
    preparationStyle: [],
    expertMode: false,
    theme: 'default'
  };
  
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [activeTab, setActiveTab] = useState<'spirits' | 'flavors' | 'settings'>('spirits');
  
  // Load preferences from localStorage on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('cocktail-preferences');
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (err) {
        console.error('Error loading preferences:', err);
      }
    }
  }, []);
  
  // Save preferences
  const savePreferences = () => {
    localStorage.setItem('cocktail-preferences', JSON.stringify(preferences));
    onSave(preferences);
    onClose();
  };
  
  // Toggle selection in an array
  const toggleSelection = (category: keyof UserPreferences, item: string) => {
    if (Array.isArray(preferences[category])) {
      const array = [...(preferences[category] as string[])];
      
      if (array.includes(item)) {
        // Remove item if already selected
        setPreferences({
          ...preferences,
          [category]: array.filter(i => i !== item)
        });
      } else {
        // Add item if not selected
        setPreferences({
          ...preferences,
          [category]: [...array, item]
        });
      }
    }
  };
  
  // Reset preferences to defaults
  const resetPreferences = () => {
    if (confirm('Are you sure you want to reset all preferences to default?')) {
      setPreferences(defaultPreferences);
      localStorage.removeItem('cocktail-preferences');
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
          <h2 className="text-lg font-display text-white">Your Preferences</h2>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            aria-label="Close preferences panel"
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
              activeTab === 'spirits' 
                ? 'text-mixology-whiskey' 
                : 'text-white/50 hover:text-white/80'
            }`}
            onClick={() => setActiveTab('spirits')}
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M11 5a3 3 0 11-6 0 3 3 0 016 0zm-9 8c0 1 1 1 1 1h5.256A4.493 4.493 0 018 12.5a4.49 4.49 0 011.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4z" />
                <path d="M16 12.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm-9.5 0a.5.5 0 000 1h9a.5.5 0 000-1h-9z" />
              </svg>
              Spirits
            </span>
            {activeTab === 'spirits' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-mixology-whiskey"></div>
            )}
          </button>
          
          <button
            className={`flex-1 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'flavors' 
                ? 'text-mixology-whiskey' 
                : 'text-white/50 hover:text-white/80'
            }`}
            onClick={() => setActiveTab('flavors')}
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M8.5 3.528v4.644c0 .729-.29 1.428-.805 1.944l-1.217 1.216a8.75 8.75 0 013.55.621l.502.201a8.75 8.75 0 004.905.642l.128-.032A2.251 2.251 0 0118 15.352V15.5a.75.75 0 01-1.5 0v-.152a.75.75 0 00-.743-.749l-.128.032a7.25 7.25 0 01-4.062-.532l-.502-.2a7.25 7.25 0 00-4.01-.69l1.91-1.909A3.25 3.25 0 008.5 8.172V3.528a.75.75 0 011.5 0zM7 7.172V3.528a2.25 2.25 0 00-4.5 0v3.644a1.75 1.75 0 01-.513 1.24l-1.61 1.61a.75.75 0 01-1.06-1.06l1.61-1.61a.25.25 0 00.073-.177V3.528a3.75 3.75 0 017.5 0z" clipRule="evenodd" />
              </svg>
              Flavors
            </span>
            {activeTab === 'flavors' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-mixology-whiskey"></div>
            )}
          </button>
          
          <button
            className={`flex-1 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'settings' 
                ? 'text-mixology-whiskey' 
                : 'text-white/50 hover:text-white/80'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.93 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Settings
            </span>
            {activeTab === 'settings' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-mixology-whiskey"></div>
            )}
          </button>
        </div>
        
        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto scrollbar-themed">
          {/* Spirits Tab */}
          {activeTab === 'spirits' && (
            <div className="p-4">
              <h3 className="text-white/80 font-medium mb-3">Preferred Spirits</h3>
              <p className="text-white/50 text-sm mb-4">Select the spirits you enjoy in your cocktails:</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Whiskey', 'Bourbon', 'Rum', 'Vodka', 'Gin', 'Tequila', 'Mezcal', 'Brandy', 'Cognac', 'Vermouth', 'Amaro', 'Liqueur'].map(spirit => (
                  <button
                    key={spirit}
                    className={`p-2 rounded-lg border text-sm font-medium transition-all duration-300 ${
                      preferences.spirits.includes(spirit)
                        ? 'bg-mixology-whiskey/20 border-mixology-whiskey text-white'
                        : 'border-mixology-elevated/50 text-white/60 hover:text-white hover:border-white/30'
                    }`}
                    onClick={() => toggleSelection('spirits', spirit)}
                  >
                    {spirit}
                  </button>
                ))}
              </div>
              
              <h3 className="text-white/80 font-medium mt-6 mb-3">Alcohol Content</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: 'any', label: 'Any Strength' },
                  { id: 'low', label: 'Low ABV' },
                  { id: 'high', label: 'High Proof' },
                  { id: 'non-alcoholic', label: 'Non-Alcoholic' }
                ].map(option => (
                  <button
                    key={option.id}
                    className={`p-2 rounded-lg border text-sm font-medium transition-all duration-300 ${
                      preferences.alcoholContent === option.id
                        ? 'bg-mixology-whiskey/20 border-mixology-whiskey text-white'
                        : 'border-mixology-elevated/50 text-white/60 hover:text-white hover:border-white/30'
                    }`}
                    onClick={() => setPreferences({...preferences, alcoholContent: option.id as any})}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Flavors Tab */}
          {activeTab === 'flavors' && (
            <div className="p-4">
              <h3 className="text-white/80 font-medium mb-3">Flavor Profile</h3>
              <p className="text-white/50 text-sm mb-4">Select your preferred flavor profiles:</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Sweet', 'Sour', 'Bitter', 'Spicy', 'Herbal', 'Fruity', 'Smoky', 'Savory', 'Refreshing', 'Creamy', 'Dry', 'Citrusy', 'Floral', 'Tropical'].map(flavor => (
                  <button
                    key={flavor}
                    className={`p-2 rounded-lg border text-sm font-medium transition-all duration-300 ${
                      preferences.flavorProfile.includes(flavor)
                        ? 'bg-mixology-whiskey/20 border-mixology-whiskey text-white'
                        : 'border-mixology-elevated/50 text-white/60 hover:text-white hover:border-white/30'
                    }`}
                    onClick={() => toggleSelection('flavorProfile', flavor)}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
              
              <h3 className="text-white/80 font-medium mt-6 mb-3">Preparation Style</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Shaken', 'Stirred', 'Blended', 'Built', 'Muddled', 'Layered', 'Hot', 'Frozen'].map(style => (
                  <button
                    key={style}
                    className={`p-2 rounded-lg border text-sm font-medium transition-all duration-300 ${
                      preferences.preparationStyle.includes(style)
                        ? 'bg-mixology-whiskey/20 border-mixology-whiskey text-white'
                        : 'border-mixology-elevated/50 text-white/60 hover:text-white hover:border-white/30'
                    }`}
                    onClick={() => toggleSelection('preparationStyle', style)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-4">
              <h3 className="text-white/80 font-medium mb-3">Application Settings</h3>
              
              {/* Expert Mode Toggle */}
              <div className="mb-4 p-3 bg-mixology-elevated/30 rounded-lg border border-mixology-elevated/50">
                <div className="flex items-start">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">Expert Mode</h4>
                    <p className="text-white/50 text-sm mt-1">Provides more technical cocktail information and advanced techniques</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={preferences.expertMode} 
                      onChange={() => setPreferences({...preferences, expertMode: !preferences.expertMode})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-mixology-elevated/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-mixology-elevated after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mixology-whiskey"></div>
                  </label>
                </div>
              </div>
              
              {/* Theme Selection */}
              <h4 className="text-white/80 font-medium mb-2">Theme</h4>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[
                  { id: 'default', label: 'Modern Dark', description: 'Default premium dark theme' },
                  { id: 'classic', label: 'Classic Bar', description: 'Traditional speakeasy style' },
                  { id: 'tiki', label: 'Tiki Lounge', description: 'Tropical beach vibes' },
                  { id: 'modern', label: 'Mixology Lab', description: 'Contemporary minimalist' }
                ].map(theme => (
                  <div
                    key={theme.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                      preferences.theme === theme.id
                        ? 'bg-mixology-whiskey/20 border-mixology-whiskey'
                        : 'border-mixology-elevated/50 hover:border-white/30'
                    }`}
                    onClick={() => setPreferences({...preferences, theme: theme.id as any})}
                  >
                    <h5 className="text-white font-medium">{theme.label}</h5>
                    <p className="text-white/50 text-xs mt-1">{theme.description}</p>
                  </div>
                ))}
              </div>
              
              {/* Reset Button */}
              <button
                onClick={resetPreferences}
                className="w-full py-2 px-4 bg-mixology-elevated/50 hover:bg-mixology-elevated border border-mixology-elevated/50 text-white/70 hover:text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39Zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219Z" clipRule="evenodd" />
                </svg>
                Reset to Defaults
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 bg-mixology-elevated/30 border-t border-mixology-elevated/50 flex justify-between">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-mixology-elevated bg-mixology-elevated/50 text-white/70 hover:text-white hover:bg-mixology-elevated rounded-lg transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          
          <button 
            onClick={savePreferences}
            className="px-4 py-2 bg-mixology-whiskey text-mixology-dark hover:bg-mixology-whiskey/90 rounded-lg transition-colors text-sm font-medium"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPanel; 