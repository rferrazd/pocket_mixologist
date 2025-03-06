"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, ArrowLeft, Loader2, Wine } from "lucide-react"
import Link from "next/link"
import { useMixologistApi } from "../../hooks/use-mixologist-api"
import ReactMarkdown from 'react-markdown'

// Define message interface
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { startConversation, sendMessage, isLoading } = useMixologistApi();

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isSending, setIsSending] = useState(false)
  const [playSound, setPlaySound] = useState(false)

  // Start conversation when the component mounts
  useEffect(() => {
    const initConversation = async () => {
      setIsSending(true);
      const initialResponse = await startConversation();
      setIsSending(false);
      
      if (initialResponse) {
        setMessages([
          {
            id: "1",
            role: "assistant",
            content: initialResponse,
          },
        ]);
      } else {
        // Fall back to default message if API call fails
        setMessages([
          {
            id: "1",
            role: "assistant",
            content: "Welcome to Pocket Mixologist. I'm your personal bartender, ready to craft the perfect cocktail for you. What are you in the mood for today? Or tell me about your preferences, and I'll suggest something special.",
          },
        ]);
      }
    };

    initConversation();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })

    // Play sound effect when new message arrives (except initial load)
    if (messages.length > 1 && !isLoading) {
      setPlaySound(true)
      setTimeout(() => setPlaySound(false), 100)
    }
  }, [messages, isLoading])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    // Add user message to UI immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear input
    setInput("");
    
    // Send to API
    setIsSending(true);
    const response = await sendMessage(input.trim());
    setIsSending(false);
    
    if (response) {
      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.agent_response,
      };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black font-sans relative">
      {/* Ambient background with animated elements */}
      <div className="ambient-bg">
        <div
          className="light-spot light-spot-pink animate-float-slow"
          style={{ top: "20%", left: "30%", width: "500px", height: "500px" }}
        ></div>
        <div
          className="light-spot light-spot-green animate-float"
          style={{ bottom: "10%", right: "20%", width: "400px", height: "400px" }}
        ></div>
        <div
          className="light-spot light-spot-blend animate-pulse-slow"
          style={{ top: "60%", left: "15%", width: "300px", height: "300px" }}
        ></div>
      </div>

      {/* Sound effect */}
      {playSound && (
        <audio autoPlay>
          <source src="/message-sound.mp3" type="audio/mpeg" />
        </audio>
      )}

      {/* Header with enhanced animations */}
      <header className="relative z-10 flex items-center px-6 py-5 bg-[#1C1C1C] border-b border-[#2C2C2C]">
        <Link
          href="/"
          className="p-2 -ml-2 mr-4 rounded-full transition-all duration-300 hover:bg-[#2C2C2C] hover:text-[hsl(var(--pink))] hover:scale-110"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center">
          <div className="relative w-10 h-10 mr-4 animate-pulse-subtle">
            <Wine className="w-6 h-6 text-[hsl(var(--pink))] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute inset-0 rounded-full border border-[hsl(var(--green))]"></div>
            <div className="absolute inset-0 rounded-full border-2 border-[hsl(var(--pink))] opacity-20 animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-2xl font-serif italic tracking-wide bg-gradient-to-r from-[hsl(var(--pink))] to-[hsl(var(--green))] bg-clip-text text-transparent animate-gradient">
              Pocket Mixologist
            </h1>
            <p className="text-xs text-zinc-400 font-sans">Crafting excellence, one drink at a time</p>
          </div>
        </div>
      </header>

      {/* Chat Messages with enhanced animations */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        <div className="max-w-2xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-8 opacity-0 animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {message.role === "assistant" && (
                <div className="w-10 h-10 rounded-full bg-[#2C2C2C] border border-[hsl(var(--green))] flex items-center justify-center mr-3 mt-1 animate-pulse-subtle">
                  <Wine className="w-5 h-5 text-[hsl(var(--pink))]" />
                </div>
              )}

              <div className={message.role === "user" ? "message-user" : "message-ai"}>
                {message.role === "assistant" ? (
                  <div className="font-sans leading-relaxed markdown-content">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="font-sans leading-relaxed">{message.content}</div>
                )}
              </div>

              {message.role === "user" && (
                <div className="w-10 h-10 rounded-full bg-[#2C2C2C] border border-[hsl(var(--pink))] flex items-center justify-center ml-3 mt-1">
                  <span className="text-[hsl(var(--green))] text-xs font-serif">You</span>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="w-10 h-10 rounded-full bg-[#2C2C2C] border border-[hsl(var(--green))] flex items-center justify-center mr-3 mt-1 animate-pulse-subtle">
                <Wine className="w-5 h-5 text-[hsl(var(--pink))]" />
              </div>
              <div className="message-ai">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 bg-[hsl(var(--pink))] rounded-full animate-pulse"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-[hsl(var(--pink))] rounded-full animate-pulse"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-[hsl(var(--pink))] rounded-full animate-pulse"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form with enhanced animations */}
      <div className="relative z-10 border-t border-[#2C2C2C] p-6 md:p-8 bg-[#1C1C1C]">
        <form onSubmit={onSubmit} className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Describe your perfect drink..."
              className="w-full bg-[#2C2C2C] text-white rounded-full px-6 py-4 pr-14 focus:outline-none focus:ring-1 focus:ring-[hsl(var(--pink))] border border-[#2C2C2C] font-sans placeholder:text-zinc-500 transition-all duration-300 focus:animate-glow"
              disabled={isSending}
            />
            <div className="absolute inset-0 rounded-full opacity-0 group-focus-within:opacity-100 bg-gradient-to-r from-[hsl(var(--pink))] to-[hsl(var(--green))] animate-gradient -z-10 blur-md transition-opacity duration-300"></div>
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full border border-[hsl(var(--pink))] text-white hover:bg-gradient-to-r hover:from-[hsl(var(--pink))] hover:to-[hsl(var(--green))] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-center text-xs text-zinc-500 mt-4 font-serif italic animate-fade-in">
            "The finest in mixology, delivered with discretion"
          </p>
        </form>
      </div>
    </div>
  )
}

