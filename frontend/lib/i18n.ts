export type Language = 'en' | 'mg' | 'tdx';

// Language metadata for display and fallback
export const languageMetadata: Record<Language, { name: string; nativeName: string; fallback: Language }> = {
  en: { name: 'English', nativeName: 'English', fallback: 'en' },
  mg: { name: 'Malagasy (Standard)', nativeName: 'Malagasy', fallback: 'en' },
  tdx: { name: 'Antandroy (Tandroy Dialect)', nativeName: 'Tandroy', fallback: 'mg' },
};

// Translation metadata for tracking uncertain terms, variants, and review status
// interface TranslationMeta {
//   value: string;
//   needsReview?: boolean; // Marks uncertain translations
//   variants?: string[]; // Alternative valid translations
//   notes?: string; // Context or explanation
//   contributor?: string; // Who contributed this translation
// }

export const translations: Record<Language, any> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      add: 'Add',
      delete: 'Delete',
      edit: 'Edit',
      save: 'Save',
      close: 'Close',
      connected: 'Connected',
      disconnected: 'Disconnected',
      status: 'Status',
      type: 'Type',
      location: 'Location',
      name: 'Name',
      value: 'Value',
      unit: 'Unit',
      latest: 'Latest',
      average: 'Average',
      minimum: 'Minimum',
      maximum: 'Maximum',
    },
    home: {
      title: 'AroRano',
      subtitle: 'IoT Device Management & Monitoring Platform',
      welcome: 'Welcome Message',
      serverStatus: 'Server Status',
      dashboard: 'IoT Monitoring Dashboard',
      dashboardDescription: 'Manage and monitor your connected IoT devices, view sensor readings, and track device statistics.',
      goToDashboard: 'Go to Dashboard',
    },
    dashboard: {
      title: 'IoT Device Monitoring Dashboard',
      devices: 'Devices',
      deviceCount: 'Devices ({count})',
      noDevices: 'No devices yet',
      addDevice: 'Add Device',
      cancelAdd: 'Cancel',
      deviceName: 'Device name',
      selectType: 'Select device type',
      location: 'Location',
      createDevice: 'Create Device',
      deleteDevice: 'Delete Device',
      confirmDelete: 'Are you sure you want to delete this device?',
      selectDevice: 'Select a device to view details',
      statistics: 'Statistics',
      liveReadings: 'Live Readings',
      noReadings: 'No readings yet',
      justNow: 'Just now',
      temperature: 'Temperature',
      humidity: 'Humidity',
      motion: 'Motion',
      pressure: 'Pressure',
      light: 'Light',
      websocketStatus: 'WebSocket Status',
      websocketConnected: 'WebSocket Connected',
      websocketDisconnected: 'WebSocket Disconnected',
    },
    deviceTypes: {
      temperature: 'Temperature Sensor',
      humidity: 'Humidity Sensor',
      motion: 'Motion Detector',
      pressure: 'Pressure Sensor',
      light: 'Light Sensor',
    },
  },
  mg: {
    common: {
      loading: 'Miandry...',
      error: 'Diso',
      success: 'Tsara',
      cancel: 'Fatsoy',
      add: 'Hasisa',
      delete: 'Hofafao',
      edit: 'Hanova',
      save: 'Tahotra',
      close: 'Hanakatso',
      connected: 'Mifandray',
      disconnected: 'Tsy mifandray',
      status: 'Toe-javatra',
      type: 'Karazana',
      location: 'Toerana',
      name: 'Anarana',
      value: 'Sanda',
      unit: 'Isa',
      latest: 'Farany',
      average: 'Salan\'karaha',
      minimum: 'Kely indrindra',
      maximum: 'Betsaka indrindra',
      justNow: 'Vao hare',
    },
    home: {
      title: 'AroRano',
      subtitle: 'Plataporma fampitantanana sy famantarana ny amboafaritra IoT',
      welcome: 'Tongasoa! Welakoa eto.',
      serverStatus: 'Toe-javatra ny serbisy',
      dashboard: 'Faritra fahita ny amboafaritra',
      dashboardDescription: 'Mitantana sy miandra-miandra ny amboafaritra IoT, hijery ny sanda avy amin\'ny fitoeram-pahalalana, ary jerena ny lalao statistika.',
      goToDashboard: 'Andeha amin\'ny faritra fahita',
    },
    dashboard: {
      title: 'Faritra fahita ny amboafaritra',
      devices: 'Amboafaritra',
      deviceCount: 'Amboafaritra ({count})',
      noDevices: 'Tsy misy amboafaritra',
      addDevice: 'Hasisa amboafaritra vaovao',
      cancelAdd: 'Fatsoy',
      deviceName: 'Anarana ny amboafaritra',
      selectType: 'Fidio ny karazana ny amboafaritra',
      location: 'Toerana',
      createDevice: 'Hamorona amboafaritra',
      deleteDevice: 'Hofafao ny amboafaritra',
      confirmDelete: 'Antoka ve ianao fa hofafao io amboafaritra io?',
      selectDevice: 'Fidio amboafaritra iray raha hijery ny antsipiriany',
      statistics: 'Lalao statistika',
      liveReadings: 'Vakitry fijelazana',
      noReadings: 'Tsy misy vakitry',
      temperature: 'Hafanana',
      humidity: 'Potpon\'afovoan',
      motion: 'Fihetsika',
      pressure: 'Entona',
      light: 'Solafaka',
      websocketStatus: 'Toe-javatra ny fifandraisan\'ny alahady',
      websocketConnected: 'Mifandray tsara',
      websocketDisconnected: 'Tsy mifandray',
    },
    deviceTypes: {
      temperature: 'Fandrefesana hafanana',
      humidity: 'Fandrefesana potpon\'afovoan',
      motion: 'Mpamantatra fihetsika',
      pressure: 'Fandrefesana entona',
      light: 'Fandrefesana solafaka',
    },
  },
  tdx: {
    // Antandroy (Tandroy) dialect translations
    // Note: Antandroy is the dialect spoken in southern Madagascar
    common: {
      loading: 'Miandry...',
      error: 'Diso',
      success: 'Tsara',
      cancel: 'Fatsoy',
      add: 'Hampitsy',
      delete: 'Hofoina',
      edit: 'Hanova',
      save: 'Hitahiry',
      close: 'Hanakatso',
      connected: 'Mifandray',
      disconnected: 'Tsy mifandray',
      status: 'Toe-javatra',
      type: 'Karazany',
      location: 'Toerana',
      name: 'Anarana',
      value: 'Sanda',
      unit: 'Isa',
      latest: 'Farany',
      average: 'Salan\'karaha',
      minimum: 'Kely indrindra',
      maximum: 'Betsaka indrindra',
      justNow: 'Vao hare',
    },
    home: {
      title: 'AroRano',
      subtitle: 'Plataporma fampitantanana sy famantarana ny amboafaritra IoT',
      welcome: 'Tongasoa! Velakoa eto.',
      serverStatus: 'Toe-javatra ny serbisy',
      dashboard: 'Faritra fahita ny amboafaritra',
      dashboardDescription: 'Mitantana sy miandra-miandra ny amboafaritra IoT, hijery ny sanda avy amin\'ny fitoeram-pahalalana, ary jerena ny lalao statistika.',
      goToDashboard: 'Andeha amin\'ny faritra fahita',
    },
    dashboard: {
      title: 'Faritra fahita ny amboafaritra',
      devices: 'Amboafaritra',
      deviceCount: 'Amboafaritra ({count})',
      noDevices: 'Tsy misy amboafaritra',
      addDevice: 'Hampitsy amboafaritra vaovao',
      cancelAdd: 'Fatsoy',
      deviceName: 'Anarana ny amboafaritra',
      selectType: 'Fidio ny karazany ny amboafaritra',
      location: 'Toerana',
      createDevice: 'Hamorona amboafaritra',
      deleteDevice: 'Hofoina ny amboafaritra',
      confirmDelete: 'Azo antoka ve hoe hofoina io amboafaritra io?',
      selectDevice: 'Fidio amboafaritra iray raha hijery ny antsipiriany',
      statistics: 'Lalao statistika',
      liveReadings: 'Vakitry fijelazana',
      noReadings: 'Tsy misy vakitry',
      temperature: 'Hafanana',
      humidity: 'Potpon\'afovoan',
      motion: 'Fihetsika',
      pressure: 'Entona',
      light: 'Solafaka',
      websocketStatus: 'Toe-javatra ny fifandraisan\'ny alahady',
      websocketConnected: 'Mifandray tsara',
      websocketDisconnected: 'Tsy mifandray',
    },
    deviceTypes: {
      temperature: 'Fandrefesana hafanana',
      humidity: 'Fandrefesana potpon\'afovoan',
      motion: 'Mpamantatra fihetsika',
      pressure: 'Fandrefesana entona',
      light: 'Fandrefesana solafaka',
    },
  },
};

let currentLanguage: Language = 'en';

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
    localStorage.setItem('languageTimestamp', new Date().toISOString());
  }
}

export function getLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('language') as Language;
    if (stored && (stored === 'en' || stored === 'mg' || stored === 'tdx')) {
      return stored;
    }
  }
  return 'en';
}

export function getCurrentLanguage(): Language {
  return currentLanguage;
}

// Cascading fallback: try primary language, then fallback chain, then English
export function t(key: string, lang?: Language): string {
  const language = lang || currentLanguage;
  const keys = key.split('.');
  
  // Define fallback chain for each language
  const fallbackChain: Record<Language, Language[]> = {
    en: ['en'],
    mg: ['mg', 'en'],
    tdx: ['tdx', 'mg', 'en'],
  };

  // Try each language in the fallback chain
  for (const tryLang of fallbackChain[language]) {
    let value: any = translations[tryLang];
    for (const k of keys) {
      value = value?.[k];
    }
    if (value) {
      // Handle TranslationMeta objects - extract the string value
      if (typeof value === 'object' && value.value) {
        return value.value;
      }
      if (typeof value === 'string') {
        return value;
      }
    }
  }

  // Return key as fallback if nothing found
  return key;
}

// Get all available languages with metadata
export function getAvailableLanguages(): { code: Language; name: string; nativeName: string }[] {
  return Object.entries(languageMetadata).map(([code, data]) => ({
    code: code as Language,
    name: data.name,
    nativeName: data.nativeName,
  }));
}

// Translation cache for offline/performance optimization
interface TranslationCache {
  language: Language;
  timestamp: number;
  data: Record<string, any>;
}

let translationCache: TranslationCache | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function cacheTranslations(language: Language) {
  translationCache = {
    language,
    timestamp: Date.now(),
    data: translations[language],
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        `translationCache_${language}`,
        JSON.stringify(translationCache)
      );
    } catch (e) {
      console.warn('Failed to cache translations:', e);
    }
  }
}

export function getCachedTranslations(language: Language): TranslationCache | null {
  if (translationCache?.language === language) {
    if (Date.now() - translationCache.timestamp < CACHE_DURATION) {
      return translationCache;
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(`translationCache_${language}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          translationCache = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to retrieve cached translations:', e);
    }
  }

  return null;
}

// Community translation suggestion system
interface TranslationSuggestion {
  language: Language;
  key: string;
  suggestedValue: string;
  reason?: string;
  userEmail?: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
}

let suggestions: TranslationSuggestion[] = [];

export function suggestTranslation(
  language: Language,
  key: string,
  suggestedValue: string,
  reason?: string,
  userEmail?: string
) {
  const suggestion: TranslationSuggestion = {
    language,
    key,
    suggestedValue,
    reason,
    userEmail,
    timestamp: Date.now(),
    status: 'pending',
  };
  suggestions.push(suggestion);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('translationSuggestions', JSON.stringify(suggestions));
    } catch (e) {
      console.warn('Failed to save translation suggestion:', e);
    }
  }

  return suggestion;
}

export function getPendingSuggestions(): TranslationSuggestion[] {
  return suggestions.filter((s) => s.status === 'pending');
}

export function approveSuggestion(index: number) {
  if (suggestions[index]) {
    suggestions[index].status = 'approved';
    if (typeof window !== 'undefined') {
      localStorage.setItem('translationSuggestions', JSON.stringify(suggestions));
    }
  }
}

export function rejectSuggestion(index: number) {
  if (suggestions[index]) {
    suggestions[index].status = 'rejected';
    if (typeof window !== 'undefined') {
      localStorage.setItem('translationSuggestions', JSON.stringify(suggestions));
    }
  }
}

// Initialize language from localStorage on client side
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('language') as Language;
  if (stored && (stored === 'en' || stored === 'mg' || stored === 'tdx')) {
    currentLanguage = stored;
  } else {
    // Try to detect browser language
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    if (browserLang === 'mg') {
      currentLanguage = 'mg';
    } else if (browserLang === 'tdx') {
      currentLanguage = 'tdx';
    } else {
      currentLanguage = 'en';
    }
    localStorage.setItem('language', currentLanguage);
  }
  
  // Cache the current language translations
  cacheTranslations(currentLanguage);
  
  // Load suggestions from localStorage
  try {
    const stored = localStorage.getItem('translationSuggestions');
    if (stored) {
      suggestions = JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load translation suggestions:', e);
  }
}
