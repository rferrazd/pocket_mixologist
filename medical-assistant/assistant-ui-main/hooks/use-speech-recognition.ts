import { useState, useCallback, useEffect } from 'react'

interface UseSpeechRecognitionProps {
  onTranscript?: (text: string) => void
  onError?: (error: string) => void
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onstart: (event: Event) => void
  onend: (event: Event) => void
  onerror: (event: Event) => void
  onresult: (event: SpeechRecognitionEvent) => void
}

export const useSpeechRecognition = ({
  onTranscript,
  onError
}: UseSpeechRecognitionProps = {}) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recognition, setRecognition] =
    useState<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        setRecognition(recognition)
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (!recognition) {
      onError?.('Speech recognition is not supported in this browser')
      return
    }

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      const currentTranscript = finalTranscript || interimTranscript
      setTranscript(currentTranscript)
      onTranscript?.(currentTranscript)
    }

    recognition.onerror = (event: Event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = (event as any).error
      console.error('Speech recognition error:', error)
      onError?.(error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    try {
      recognition.start()
    } catch (error) {
      console.error('Speech recognition start error:', error)
    }
  }, [recognition, onError, onTranscript])

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop()
      setIsListening(false)
    }
  }, [recognition])

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: !!recognition
  }
}
