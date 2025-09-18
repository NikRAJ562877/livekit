// Text-to-speech utilities for speaking transfer summaries
export class TextToSpeechManager {
  private synthesis: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []

  constructor() {
    if (typeof window !== "undefined") {
      this.synthesis = window.speechSynthesis
      this.loadVoices()
    }
  }

  private loadVoices(): void {
    if (!this.synthesis) return

    const updateVoices = () => {
      this.voices = this.synthesis!.getVoices()
    }

    updateVoices()
    this.synthesis.onvoiceschanged = updateVoices
  }

  async speakTransferScript(text: string, agentName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error("Speech synthesis not available"))
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)

      // Configure voice settings
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 0.8

      // Try to find a professional-sounding voice
      const preferredVoice = this.voices.find(
        (voice) => voice.name.includes("Professional") || voice.name.includes("Neural") || voice.lang.startsWith("en-"),
      )

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.onend = () => resolve()
      utterance.onerror = (error) => reject(error)

      // Add agent identification
      const fullText = `${agentName} speaking: ${text}`
      utterance.text = fullText

      this.synthesis.speak(utterance)
    })
  }

  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel()
    }
  }

  isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false
  }
}

export const ttsManager = new TextToSpeechManager()
