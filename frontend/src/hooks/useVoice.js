import { useState, useRef, useCallback } from 'react'

export function useSpeechRecognition(onResult) {
  const [isRecording, setIsRecording] = useState(false)
  const [status, setStatus] = useState('Click mic to ask by voice')
  const recognitionRef = useRef(null)

  const toggle = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      alert('Voice input requires Chrome browser.')
      return
    }

    if (isRecording) {
      recognitionRef.current?.stop()
      return
    }

    const rec = new SR()
    rec.lang = 'en-IN'
    rec.continuous = false
    rec.interimResults = false

    rec.onstart = () => {
      setIsRecording(true)
      setStatus('Speak now — click to stop')
    }
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript
      onResult(text)
      setStatus(`Heard: "${text}"`)
    }
    rec.onerror = () => setStatus('Could not hear — try again.')
    rec.onend = () => {
      setIsRecording(false)
      setStatus('Click mic to ask by voice')
    }

    rec.start()
    recognitionRef.current = rec
  }, [isRecording, onResult])

  return { isRecording, status, toggle }
}

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = useCallback((text) => {
    if (!text) return
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'en-IN'
    utt.rate = 0.92
    utt.onstart = () => setIsSpeaking(true)
    utt.onend = () => setIsSpeaking(false)
    utt.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utt)
  }, [isSpeaking])

  return { isSpeaking, speak }
}
