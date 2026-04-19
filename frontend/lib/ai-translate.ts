/**
 * AI Translation Service
 * Provides automatic translation to Malagasy using free APIs and cached translations
 */

const TRANSLATION_CACHE: Map<string, string> = new Map();

// Use LibreTranslate API (free, open-source)
const LIBRE_TRANSLATE_URL = 'https://libretranslate.de/translate';

// Fallback manual translations for common UI terms
const MANUAL_TRANSLATIONS: Record<string, string> = {
  'Loading...': 'Miandry...',
  'Error': 'Hadisoana',
  'Success': 'Nahomby',
  'Cancel': 'Ajanona',
  'Add': 'Hanampy',
  'Delete': 'Fafao',
  'Edit': 'Havaozina',
  'Save': 'Tehirizo',
  'Close': 'Akatona',
  'Connected': 'Nifandray',
  'Disconnected': 'Tsy nifandray',
  'Status': 'Toe-java',
  'Type': 'Karazany',
  'Location': 'Toerana',
  'Name': 'Anarana',
  'Value': 'Sanda',
  'Unit': 'Singasinga',
  'Latest': 'Farany indrindra',
  'Average': 'Salan-dalana',
  'Minimum': 'Kely indrindra',
  'Maximum': 'Lehibe indrindra',
  'Dashboard': 'Tableau de bord',
  'Devices': 'Fitaovana',
  'Readings': 'Vakiteny',
  'Alerts': 'Fampitandremana',
  'Settings': 'Fikirana',
  'Language': 'Fiteny',
  'English': 'English',
  'Malagasy': 'Malagasy',
  'Refresh': 'Havaozy',
  'Search': 'Tadiavo',
  'Filter': 'Sisao',
  'Export': 'Alaina',
  'Back': 'Hiverina',
  'Home': 'Fandraisana',
};

/**
 * Detect user's preferred language from browser
 */
export function detectBrowserLanguage(): 'en' | 'mg' {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language?.split('-')[0].toLowerCase() || 'en';
  
  // Check if Malagasy is preferred
  if (browserLang === 'mg') return 'mg';
  
  // Check if user's language is similar to Malagasy region
  if (navigator.languages) {
    for (const lang of navigator.languages) {
      if (lang.toLowerCase().startsWith('mg')) return 'mg';
    }
  }
  
  return 'en';
}

/**
 * Get language preference from localStorage
 */
export function getSavedLanguage(): 'en' | 'mg' | null {
  if (typeof window === 'undefined') return null;
  return (localStorage.getItem('arorano_language') as 'en' | 'mg') || null;
}

/**
 * Save language preference to localStorage
 */
export function saveLanguage(lang: 'en' | 'mg'): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('arorano_language', lang);
  }
}

/**
 * Get user's language preference (saved > browser > default)
 */
export function getUserLanguage(): 'en' | 'mg' {
  const saved = getSavedLanguage();
  if (saved) return saved;
  
  const detected = detectBrowserLanguage();
  if (detected === 'mg') return 'mg';
  
  return (process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE as 'en' | 'mg') || 'mg';
}

/**
 * Translate text using LibreTranslate API with fallback
 */
export async function translateText(text: string, targetLang: 'en' | 'mg' = 'mg'): Promise<string> {
  if (targetLang === 'en' || !text) return text;
  
  // Check manual translations first
  const cacheKey = `${text}->mg`;
  if (TRANSLATION_CACHE.has(cacheKey)) {
    return TRANSLATION_CACHE.get(cacheKey) || text;
  }
  
  // Check manual fallback translations
  if (MANUAL_TRANSLATIONS[text]) {
    TRANSLATION_CACHE.set(cacheKey, MANUAL_TRANSLATIONS[text]);
    return MANUAL_TRANSLATIONS[text];
  }
  
  // Try LibreTranslate API (free, no auth needed)
  try {
    const response = await fetch(LIBRE_TRANSLATE_URL, {
      method: 'POST',
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: 'mg',
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      const translated = data.translatedText || text;
      TRANSLATION_CACHE.set(cacheKey, translated);
      return translated;
    }
  } catch (error) {
    console.debug('Translation API error, using fallback:', error);
  }
  
  // If API fails, return original text
  return text;
}

/**
 * Batch translate multiple strings
 */
export async function translateBatch(texts: string[], targetLang: 'en' | 'mg' = 'mg'): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  
  for (const text of texts) {
    results[text] = await translateText(text, targetLang);
  }
  
  return results;
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(): void {
  TRANSLATION_CACHE.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: TRANSLATION_CACHE.size,
    keys: Array.from(TRANSLATION_CACHE.keys()),
  };
}
