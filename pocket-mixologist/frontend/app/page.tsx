"use client"

import Link from "next/link"
import { ArrowRight, Wine, Sparkles, Droplets } from "lucide-react"
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { startConversation } from "@/lib/api"

export default function LandingPage() {
  const router = useRouter();

  const handleStartConversation = async () => {
    try {
      // Start a conversation with the cocktail agent
      const response = await startConversation();
      
      // Store the initial agent response and config in session storage
      sessionStorage.setItem('agentInitialResponse', response.agent_response);
      sessionStorage.setItem('agentConfig', JSON.stringify(response.config));
      
      // Navigate to the chat page
      router.push('/chat');
    } catch (error) {
      console.error('Failed to start conversation:', error);
      // Navigate to chat page anyway, but there won't be an initial message
      router.push('/chat');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <Particles />
      </div>

      {/* Ambient background */}
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

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[hsl(var(--pink))]/5 blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-[hsl(var(--green))]/10 blur-3xl animate-float"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center space-y-12 px-4 text-center max-w-3xl">
        <div className="space-y-6">
          <div className="inline-block mx-auto mb-2 p-1 rounded-full bg-gradient-to-r from-[hsl(var(--pink))]/20 to-[hsl(var(--green))]/20 backdrop-blur-sm border border-[hsl(var(--pink))]/30 animate-shimmer overflow-hidden">
            <span className="px-4 py-1 text-xs font-medium text-[hsl(var(--pink))] rounded-full font-sans">
              Your Personal Bartender
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter font-serif italic animate-text-reveal">
            Pocket{" "}
            <span className="bg-gradient-to-r from-[hsl(var(--pink))] to-[hsl(var(--green))] bg-clip-text text-transparent animate-gradient">
              Mixologist
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-md mx-auto font-sans animate-fade-in-up">
            Craft the perfect cocktail tailored to your taste.
          </p>
        </div>

        <button
          onClick={handleStartConversation}
          className="group relative inline-flex items-center justify-center px-8 py-3.5 overflow-hidden rounded-full transition-all duration-300 animate-bounce-subtle"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[hsl(var(--pink))] to-[hsl(var(--green))] opacity-90"></span>
          <span className="absolute bottom-0 right-0 block w-64 h-64 mb-32 mr-4 transition duration-500 origin-bottom-left transform rotate-45 translate-x-24 bg-[hsl(var(--pink))] opacity-30 group-hover:rotate-90 ease"></span>
          <span className="relative flex items-center gap-2 text-white font-medium font-sans">
            Craft Your Cocktail
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </button>

        <div className="pt-10 grid grid-cols-3 gap-8 max-w-lg w-full">
          <div className="flex flex-col items-center text-center group">
            <div
              className="w-12 h-12 mb-3 rounded-full bg-[#1C1C1C] border border-[hsl(var(--pink))]/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-[hsl(var(--pink))] animate-fade-in-up"
              style={{ animationDelay: "100ms" }}
            >
              <Wine className="w-6 h-6 text-[hsl(var(--pink))] group-hover:text-white transition-all duration-300" />
            </div>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div
              className="w-12 h-12 mb-3 rounded-full bg-[#1C1C1C] border border-[hsl(var(--green))]/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-[hsl(var(--green))] animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              <Sparkles className="w-6 h-6 text-[hsl(var(--green))] group-hover:text-white transition-all duration-300" />
            </div>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div
              className="w-12 h-12 mb-3 rounded-full bg-[#1C1C1C] border border-[hsl(var(--pink))]/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-[hsl(var(--pink))] animate-fade-in-up"
              style={{ animationDelay: "300ms" }}
            >
              <Droplets className="w-6 h-6 text-[hsl(var(--pink))] group-hover:text-white transition-all duration-300" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center text-zinc-500 text-sm font-serif italic animate-fade-in">
        <p>Must be of legal drinking age to use this service</p>
      </div>
    </div>
  )
}

// Particle animation component
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Particle class
    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = Math.random() * 0.5 - 0.25
        this.speedY = Math.random() * 0.5 - 0.25
        this.color =
          Math.random() > 0.5
            ? `hsla(var(--pink), ${Math.random() * 20 + 10}%)`
            : `hsla(var(--green), ${Math.random() * 20 + 10}%)`
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width) this.x = 0
        else if (this.x < 0) this.x = canvas.width

        if (this.y > canvas.height) this.y = 0
        else if (this.y < 0) this.y = canvas.height
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Create particles
    const particlesArray: Particle[] = []
    const numberOfParticles = Math.min(100, window.innerWidth / 20)

    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle())
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update()
        particlesArray[i].draw()
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 opacity-30" />
}

