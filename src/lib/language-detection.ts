// Simple language detection utility
export interface LanguageDetection {
  code: string
  name: string
  confidence: number
  flag: string
}

// Language patterns and characteristics
const languagePatterns = {
  en: {
    name: 'English',
    flag: '🇺🇸',
    patterns: [
      /\b(the|and|is|in|to|of|a|that|it|with|for|as|was|on|are|you)\b/gi,
      /ing\b/gi,
      /tion\b/gi,
      /[aeiou]/gi
    ],
    commonWords: ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with'],
    charRanges: [/[a-zA-Z]/g]
  },
  es: {
    name: 'Spanish',
    flag: '🇪🇸',
    patterns: [
      /\b(el|la|de|que|y|en|un|es|se|no|te|lo|le|da|su|por|son|con|para|como|las|dos|pero|todo|bien|puede|este|ser|hacer|cada|día|agua|hacia|muchos|antes|debe|poder|estos|había|mí|muy|aquí|solo|hasta|después|he|estado|siempre|últimos)\b/gi,
      /ción\b/gi,
      /dad\b/gi,
      /[áéíóúüñ]/gi
    ],
    commonWords: ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no'],
    charRanges: [/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/g]
  },
  fr: {
    name: 'French',
    flag: '🇫🇷',
    patterns: [
      /\b(le|de|et|à|un|il|être|et|en|avoir|que|pour|dans|ce|son|une|sur|avec|ne|se|pas|tout|plus|ment|vous|bien|où|sans|moi|faire|été|elle|nous|temps|très|dire|que|non|qui|sont|même|après|cette|comme|votre|peut|mon|aussi|nos|aux|tous|vos|eux|ces|seul|entre|encore|depuis|tant|déjà|chose|rien|plus|peu|peu|comment|même|leurs|tel|part|part|fin|sous|fait|deux|grand|lors|moins|autant|main|mise|fois|assez|point|vie|ordre|groupe|vers|devant|donner|venir|entrer|avons|avez|ont|serez|serons|furent|sera|serait|seront|suis|est|sommes|êtes|sont|était|étais)\b/gi,
      /tion\b/gi,
      /ment\b/gi,
      /[àâäçéèêëïîôùûüÿ]/gi
    ],
    commonWords: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir'],
    charRanges: [/[a-zA-ZàâäçéèêëïîôùûüÿÀÂÄÇÉÈÊËÏÎÔÙÛÜŸ]/g]
  },
  de: {
    name: 'German',
    flag: '🇩🇪',
    patterns: [
      /\b(der|die|und|in|den|von|zu|das|mit|sich|des|auf|für|ist|im|dem|nicht|ein|eine|als|auch|es|an|werden|aus|er|hat|dass|sie|nach|wird|bei|noch|wie|einem|über|einen)\b/gi,
      /ung\b/gi,
      /lich\b/gi,
      /[äöüß]/gi
    ],
    commonWords: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich'],
    charRanges: [/[a-zA-ZäöüßÄÖÜ]/g]
  },
  it: {
    name: 'Italian',
    flag: '🇮🇹',
    patterns: [
      /\b(il|di|che|e|la|per|un|in|è|da|a|con|del|le|si|come|non|al|una|su|sono|alla|lo|tutto|anche|se|più|della|essere|questa|quello|molto|quando|fare|dove|bene|dopo|ogni|questo|grande|stato|può|tempo|prima|così|solo|casa|due|dire|stesso|mondo|vita|parte|ancora|nessuno|vedere)\b/gi,
      /zione\b/gi,
      /mente\b/gi,
      /[àèéìíîòóù]/gi
    ],
    commonWords: ['il', 'di', 'che', 'e', 'la', 'per', 'un', 'in', 'è', 'da'],
    charRanges: [/[a-zA-ZàèéìíîòóùÀÈÉÌÍÎÒÓÙ]/g]
  },
  pt: {
    name: 'Portuguese',
    flag: '🇵🇹',
    patterns: [
      /\b(o|de|a|e|que|do|da|em|um|para|é|com|não|uma|os|no|se|na|por|mais|as|dos|como|mas|foi|ao|ele|das|tem|à|seu|sua|ou|ser|quando|muito|há|nos|já|está|eu|também|só|pelo|pela|até|isso|ela|entre|era|depois|sem|mesmo|aos|ter|seus|quem|nas|tão|nem|seus|essas|esses|pelas|pelos|toda|todos|outras|outro)\b/gi,
      /ção\b/gi,
      /mente\b/gi,
      /[ãâáàçéêíóôõú]/gi
    ],
    commonWords: ['o', 'de', 'a', 'e', 'que', 'do', 'da', 'em', 'um', 'para'],
    charRanges: [/[a-zA-ZãâáàçéêíóôõúÃÂÁÀÇÉÊÍÓÔÕÚ]/g]
  },
  tr: {
    name: 'Turkish',
    flag: '🇹🇷',
    patterns: [
      /\b(bir|bu|ve|da|de|o|ile|için|var|en|ne|ben|sen|ol|et|yap|gel|git|gör|bil|ver)(m|n|k|niz|lar|ler|dir|tir|miş|muş|ecek|acak)?\b/gi,
      /[çğıöşü]/gi,
      /(lar|ler)\b/gi,
      /(dir|tir)\b/gi
    ],
    commonWords: ['bir', 'bu', 've', 'da', 'de', 'o', 'ile', 'için', 'var', 'en'],
    charRanges: [/[a-zA-ZçğıöşüÇĞIİÖŞÜ]/g]
  },
  ar: {
    name: 'Arabic',
    flag: '🇸🇦',
    patterns: [
      /[\u0600-\u06FF]/g,
      /\b(في|من|إلى|على|عن|مع|هذا|هذه|ذلك|تلك|الذي|التي|كان|كانت|يكون|تكون|هو|هي|أن|إن|لا|نعم|ما|متى|أين|كيف|لماذا|ماذا)\b/g
    ],
    commonWords: ['في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك'],
    charRanges: [/[\u0600-\u06FF]/g]
  },
  ru: {
    name: 'Russian',
    flag: '🇷🇺',
    patterns: [
      /[\u0400-\u04FF]/g,
      /\b(в|и|не|на|я|быть|тот|он|оно|она|а|как|что|это|все|ещё|также|наш|мой|который|мочь|время|рука|два|другой|после|работа|тысяча|несколько|сейчас|во|многий|пойти|знать|вода|более|очень|сам|хорошо|другой|старый|хотеть|сказать|здесь|слово|где|стоять|думать|место|спросить|ответить|работать|жизнь|девушка|играть|жить|месяц)\b/g
    ],
    commonWords: ['в', 'и', 'не', 'на', 'я', 'быть', 'тот', 'он', 'оно', 'она'],
    charRanges: [/[\u0400-\u04FF]/g]
  },
  zh: {
    name: 'Chinese',
    flag: '🇨🇳',
    patterns: [
      /[\u4e00-\u9fff]/g,
      /[\u3400-\u4dbf]/g,
      /[\uf900-\ufaff]/g
    ],
    commonWords: ['的', '一', '是', '不', '了', '人', '我', '在', '有', '他'],
    charRanges: [/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g]
  },
  ja: {
    name: 'Japanese',
    flag: '🇯🇵',
    patterns: [
      /[\u3040-\u309f]/g, // Hiragana
      /[\u30a0-\u30ff]/g, // Katakana
      /[\u4e00-\u9fff]/g  // Kanji
    ],
    commonWords: ['の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し'],
    charRanges: [/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/g]
  },
  ko: {
    name: 'Korean',
    flag: '🇰🇷',
    patterns: [
      /[\uac00-\ud7af]/g, // Hangul syllables
      /[\u1100-\u11ff]/g, // Hangul jamo
      /[\u3130-\u318f]/g  // Hangul compatibility jamo
    ],
    commonWords: ['이', '그', '저', '것', '수', '있', '하', '되', '어', '들'],
    charRanges: [/[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/g]
  }
}

export function detectLanguage(text: string): LanguageDetection[] {
  if (!text || text.trim().length === 0) {
    return []
  }

  const results: LanguageDetection[] = []
  const cleanText = text.toLowerCase().trim()

  for (const [code, lang] of Object.entries(languagePatterns)) {
    let score = 0
    let totalChecks = 0

    // Check character patterns
    for (const charRange of lang.charRanges) {
      const matches = cleanText.match(charRange)
      if (matches) {
        score += matches.length
      }
      totalChecks += cleanText.length
    }

    // Check language-specific patterns
    for (const pattern of lang.patterns) {
      const matches = cleanText.match(pattern)
      if (matches) {
        score += matches.length * 2 // Weight patterns higher
      }
      totalChecks += 10 // Base check value
    }

    // Check common words
    for (const word of lang.commonWords) {
      const wordRegex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'g')
      const matches = cleanText.match(wordRegex)
      if (matches) {
        score += matches.length * 3 // Weight common words highest
      }
      totalChecks += 5
    }

    // Calculate raw score
    const rawScore = totalChecks > 0 ? score : 0

    if (rawScore > 0) {
      results.push({
        code,
        name: lang.name,
        confidence: rawScore, // Store raw score temporarily
        flag: lang.flag
      })
    }
  }

  // Filter out very low scores first
  const filteredResults = results.filter(r => r.confidence > 0)
  
  if (filteredResults.length === 0) {
    return []
  }

  // Calculate total of all raw scores
  const totalRawScore = filteredResults.reduce((sum, result) => sum + result.confidence, 0)

  // Normalize to percentages that total 100%
  // This ensures all confidence scores add up to exactly 100%
  const normalizedResults = filteredResults.map(result => ({
    ...result,
    confidence: Math.round((result.confidence / totalRawScore) * 100)
  }))

  // Ensure total is exactly 100% (handle rounding errors)
  // Due to Math.round(), the total might be slightly off (e.g., 99% or 101%)
  // We adjust the highest confidence result to make it exactly 100%
  const currentTotal = normalizedResults.reduce((sum, result) => sum + result.confidence, 0)
  if (currentTotal !== 100 && normalizedResults.length > 0) {
    const difference = 100 - currentTotal
    normalizedResults[0].confidence += difference
    
    // Ensure no negative values after adjustment
    if (normalizedResults[0].confidence < 0) {
      normalizedResults[0].confidence = 0
    }
  }

  // Sort by confidence (highest first)
  normalizedResults.sort((a, b) => b.confidence - a.confidence)

  // Return top 5 results
  return normalizedResults.slice(0, 5)
}

export function getMostLikelyLanguage(text: string): LanguageDetection | null {
  const detections = detectLanguage(text)
  return detections.length > 0 ? detections[0] : null
}

// TTS voice mapping for different languages
export const ttsVoiceMapping = {
  en: ['en-US', 'en-GB', 'en-AU'],
  es: ['es-ES', 'es-MX', 'es-AR'],
  fr: ['fr-FR', 'fr-CA'],
  de: ['de-DE', 'de-AT'],
  it: ['it-IT'],
  pt: ['pt-PT', 'pt-BR'],
  tr: ['tr-TR'],
  ar: ['ar-SA', 'ar-EG'],
  ru: ['ru-RU'],
  zh: ['zh-CN', 'zh-TW'],
  ja: ['ja-JP'],
  ko: ['ko-KR']
}