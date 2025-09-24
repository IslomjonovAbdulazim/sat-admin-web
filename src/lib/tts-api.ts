// Backend TTS API integration
import api from './api'

// Popular voice mappings for different languages with good default choices
const VOICE_MAPPING = {
  en: 'aria',      // English - Natural female voice
  es: 'monica',    // Spanish - Natural female voice
  fr: 'celine',    // French - Natural female voice  
  de: 'marlene',   // German - Natural female voice
  it: 'carla',     // Italian - Natural female voice
  pt: 'ines',      // Portuguese - Natural female voice
  tr: 'filiz',     // Turkish - Natural female voice
  ar: 'zeina',     // Arabic - Natural female voice
  ru: 'tatyana',   // Russian - Natural female voice
  zh: 'zhiyu',     // Chinese - Natural female voice
  ja: 'mizuki',    // Japanese - Natural female voice
  ko: 'seoyeon'    // Korean - Natural female voice
}

// Fallback voice for unsupported languages
const DEFAULT_VOICE = 'aria'

interface TTSOptions {
  text: string
  languageCode: string
}

interface TTSResponse {
  success: boolean
  audioBlob?: Blob
  error?: string
}

export async function generateAudio({ text, languageCode }: TTSOptions): Promise<TTSResponse> {
  try {
    console.log(`Generating audio for "${text}" in ${languageCode}`)
    
    // Call backend endpoint without voice parameter
    const response = await api.post('/api/v1/super-admin/generate-audio', {
      text
    }, {
      responseType: 'blob',
      headers: {
        'Accept': 'audio/m4a',
      },
    })

    // Get audio blob from response
    const audioBlob = response.data as Blob
    
    if (audioBlob.size === 0) {
      throw new Error('Received empty audio file')
    }

    console.log(`Generated audio: ${audioBlob.size} bytes, type: ${audioBlob.type}`)
    
    return {
      success: true,
      audioBlob
    }

  } catch (error) {
    console.error('TTS Generation Error:', error)
    
    let errorMessage = 'Failed to generate audio'
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorMessage = 'Authentication required. Please log in again.'
      } else if (error.message.includes('403')) {
        errorMessage = 'You do not have permission to generate audio.'
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please try again later.'
      } else if (error.message.includes('500')) {
        errorMessage = 'TTS service is currently unavailable. Please try again later.'
      } else {
        errorMessage = error.message
      }
    }

    return {
      success: false,
      error: errorMessage
    }
  }
}

// Convert audio blob to File for upload
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, {
    type: blob.type,
    lastModified: Date.now()
  })
}

// Get supported voices for a language
export function getSupportedVoice(languageCode: string): string {
  return VOICE_MAPPING[languageCode as keyof typeof VOICE_MAPPING] || DEFAULT_VOICE
}

// Get all supported languages
export function getSupportedLanguages(): string[] {
  return Object.keys(VOICE_MAPPING)
}

// Preview voice information
export function getVoiceInfo(languageCode: string): { voice: string; description: string } {
  const voice = getSupportedVoice(languageCode)
  
  const descriptions = {
    aria: 'Natural English female voice',
    monica: 'Natural Spanish female voice',
    celine: 'Natural French female voice',
    marlene: 'Natural German female voice',
    carla: 'Natural Italian female voice',
    ines: 'Natural Portuguese female voice',
    filiz: 'Natural Turkish female voice',
    zeina: 'Natural Arabic female voice',
    tatyana: 'Natural Russian female voice',
    zhiyu: 'Natural Chinese female voice',
    mizuki: 'Natural Japanese female voice',
    seoyeon: 'Natural Korean female voice'
  }
  
  return {
    voice,
    description: descriptions[voice as keyof typeof descriptions] || 'Natural female voice'
  }
}