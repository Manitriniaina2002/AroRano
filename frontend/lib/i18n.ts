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
      reservoirRepresentation: 'Reservoir Representation',
      reservoirOptimal: 'Optimal',
      reservoirNormal: 'Normal',
      reservoirLow: 'Low',
      currentWaterLevel: 'Current Water Level',
      waterSystemSetup: 'Water System Setup',
      setupDescription: 'Physical assembly connected to this monitoring solution',
    },
    deviceTypes: {
      // Sensors
      waterLevel: 'Water Level Sensor',
      rainSensor: 'Rain Sensor',
      ultrasonic: 'Ultrasonic Sensor',
      dht22: 'DHT22 Sensor',
      temperature: 'Temperature Sensor',
      humidity: 'Humidity Sensor',
      // Actuators
      waterPump: 'Water Pump',
      relay: 'Relay Control',
      // Indicators
      buzzer: 'Alarm Buzzer',
      ledRGB: 'RGB LED',
      lcdScreen: 'LCD Display',
      // Control
      pushButton: 'Push Button',
      // Microcontroller
      esp32: 'ESP32 Microcontroller',
      // Legacy
      turbidity: 'Turbidity Sensor',
      ph: 'pH Sensor',
      flowRate: 'Flow Rate Sensor',
      motion: 'Motion Detector',
      pressure: 'Pressure Sensor',
      light: 'Light Sensor',
    },
    home: {
      title: 'AroRano',
      subtitle: 'IoT Device Management & Monitoring Platform',
      welcome: 'Welcome Message',
      serverStatus: 'Server Status',
      dashboard: 'IoT Monitoring Dashboard',
      dashboardDescription: 'Manage and monitor your connected IoT devices, view sensor readings, and track device statistics.',
      goToDashboard: 'Go to Dashboard',
      smartWaterMonitoring: 'Smart Water Monitoring',
      realtimeMonitoringDesc: 'Real-time reservoir monitoring with intelligent sensors and analytics',
      realtimeMonitoring: 'Real-time Monitoring',
      realtimeMonitoringDetail: 'Instant water level tracking and sensor data',
      multiSensorSupport: 'Multi-Sensor Support',
      multiSensorDetail: 'Temperature, pH, turbidity & flow monitoring',
      smartAlerts: 'Smart Alerts',
      smartAlertsDetail: 'Instant notifications for critical events',
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
      subtitle: 'Platform Fampitantanana sy Famantarana IoT',
      welcome: 'Tongasoa! Welakoa eto.',
      serverStatus: 'Toe-javatra Server',
      dashboard: 'Dashboard Famantarana Amboafaritra',
      dashboardDescription: 'Mitantana sy miandra-miandra ny amboafaritra IoT, hijery ny sanda avy amin\'ny Sensor, ary jerena ny Statistika.',
      goToDashboard: 'Andeha amin\'ny Dashboard',
      smartWaterMonitoring: 'Smart Water Monitoring',
      realtimeMonitoringDesc: 'Real-time Monitoring amin\'ny Fato-dranomaìnty miaraka amin\'ny Sensor Fahdalana',
      realtimeMonitoring: 'Real-time Monitoring',
      realtimeMonitoringDetail: 'Famantarana haavon\'ny rano sy sanda avy amin\'ny Sensor',
      multiSensorSupport: 'Fanampian\'ny Sensor Maro',
      multiSensorDetail: 'Famantarana hafanana, pH, turbidity & flow rate amin\'ny rano',
      smartAlerts: 'Smart Alerts',
      smartAlertsDetail: 'Famantarana avy hatrany ho an\'ny zava-mitranga manan-danja',
    },
    dashboard: {
      title: 'Dashboard Famantarana Amboafaritra',
      devices: 'Amboafaritra',
      deviceCount: 'Amboafaritra ({count})',
      noDevices: 'Tsy misy amboafaritra po',
      addDevice: 'Hasisa Amboafaritra Vaovao',
      cancelAdd: 'Fatsoy',
      deviceName: 'Anarana Amboafaritra',
      selectType: 'Fidio Karazana Amboafaritra',
      location: 'Toerana',
      createDevice: 'Hamorona Amboafaritra',
      deleteDevice: 'Hofafao Amboafaritra',
      confirmDelete: 'Antoka ve ianao fa hofafao io amboafaritra io?',
      selectDevice: 'Fidio amboafaritra iray raha hijery ny antsipiriany',
      statistics: 'Statistika',
      liveReadings: 'Vakitry Tena-potoana',
      noReadings: 'Tsy misy vakitry',
      temperature: 'Hafanana',
      humidity: 'Potpon\'afovoan',
      motion: 'Fihetsika',
      pressure: 'Entona',
      light: 'Solafaka',
      websocketStatus: 'Toe-javatra WebSocket',
      websocketConnected: 'WebSocket Mifandray',
      websocketDisconnected: 'WebSocket Tsy Mifandray',
      reservoirRepresentation: 'Fandrefesana Fato-dranomaìnty',
      reservoirOptimal: 'Tsara Loatra',
      reservoirNormal: 'Mahazatra',
      reservoirLow: 'Kely Loatra',
      currentWaterLevel: 'Haavon\'ny Rano Ankehitriny',
      waterSystemSetup: 'Afinoan\'ny Rafitra Rano',
      setupDescription: 'Fametafetana ara-batana mifandray amin\'ity famantarana ity',
    },
    deviceTypes: {
      // Sensors
      waterLevel: 'Water Level Sensor',
      rainSensor: 'Rain Sensor',
      ultrasonic: 'Ultrasonic Sensor',
      dht22: 'DHT22 Sensor',
      temperature: 'Temperature Sensor',
      humidity: 'Humidity Sensor',
      // Actuators
      waterPump: 'Water Pump',
      relay: 'Relay Control',
      // Indicators
      buzzer: 'Alarm Buzzer',
      ledRGB: 'RGB LED',
      lcdScreen: 'LCD Display',
      // Control
      pushButton: 'Push Button',
      // Microcontroller
      esp32: 'ESP32 Microcontroller',
      // Legacy
      turbidity: 'Turbidity Sensor',
      ph: 'pH Sensor',
      flowRate: 'Flow Rate Sensor',
      motion: 'Motion Detector',
      pressure: 'Pressure Sensor',
      light: 'Light Sensor',
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
      subtitle: 'Platform Fampitantanana sy Famantarana IoT',
      welcome: 'Tongasoa! Velakoa eto.',
      serverStatus: 'Toe-javatra Server',
      dashboard: 'Dashboard Famantarana Amboafaritra',
      dashboardDescription: 'Mitantana sy miandra-miandra ny amboafaritra IoT, hijery ny sanda avy amin\'ny Sensor, ary jerena ny Statistika.',
      goToDashboard: 'Andeha amin\'ny Dashboard',
      smartWaterMonitoring: 'Smart Water Monitoring',
      realtimeMonitoringDesc: 'Real-time Monitoring amin\'ny Fato-dranomaìnty miaraka amin\'ny Sensor Fahdalana',
      realtimeMonitoring: 'Real-time Monitoring',
      realtimeMonitoringDetail: 'Famantarana haavon\'ny rano sy sanda avy amin\'ny Sensor',
      multiSensorSupport: 'Fanampian\'ny Sensor Maro',
      multiSensorDetail: 'Famantarana hafanana, pH, turbidity & flow rate amin\'ny rano',
      smartAlerts: 'Smart Alerts',
      smartAlertsDetail: 'Famantarana avy hatrany ho an\'ny zava-mitranga manan-danja',
    },
    dashboard: {
      title: 'Dashboard Famantarana Amboafaritra',
      devices: 'Amboafaritra',
      deviceCount: 'Amboafaritra ({count})',
      noDevices: 'Tsy misy amboafaritra po',
      addDevice: 'Hampitsy Amboafaritra Vaovao',
      cancelAdd: 'Fatsoy',
      deviceName: 'Anarana Amboafaritra',
      selectType: 'Fidio Karazany Amboafaritra',
      location: 'Toerana',
      createDevice: 'Hamorona Amboafaritra',
      deleteDevice: 'Hofoina Amboafaritra',
      confirmDelete: 'Azo antoka ve hoe hofoina io amboafaritra io?',
      selectDevice: 'Fidio amboafaritra iray raha hijery ny antsipiriany',
      statistics: 'Statistika',
      liveReadings: 'Vakitry Tena-potoana',
      noReadings: 'Tsy misy vakitry',
      temperature: 'Hafanana',
      humidity: 'Potpon\'afovoan',
      motion: 'Fihetsika',
      pressure: 'Entona',
      light: 'Solafaka',
      websocketStatus: 'Toe-javatra WebSocket',
      websocketConnected: 'WebSocket Mifandray',
      websocketDisconnected: 'WebSocket Tsy Mifandray',
      reservoirRepresentation: 'Fandrefesana Fato-dranomaìnty',
      reservoirOptimal: 'Tsara Loatra',
      reservoirNormal: 'Mahazatra',
      reservoirLow: 'Kely Loatra',
      currentWaterLevel: 'Haavon\'ny Rano Ankehitriny',
      waterSystemSetup: 'Afinoan\'ny Rafitra Rano',
      setupDescription: 'Fametafetana ara-batana mifandray amin\'ity famantarana ity',
    },
    deviceTypes: {
      // Sensors
      waterLevel: 'Water Level Sensor',
      rainSensor: 'Rain Sensor',
      ultrasonic: 'Ultrasonic Sensor',
      dht22: 'DHT22 Sensor',
      temperature: 'Temperature Sensor',
      humidity: 'Humidity Sensor',
      // Actuators
      waterPump: 'Water Pump',
      relay: 'Relay Control',
      // Indicators
      buzzer: 'Alarm Buzzer',
      ledRGB: 'RGB LED',
      lcdScreen: 'LCD Display',
      // Control
      pushButton: 'Push Button',
      // Microcontroller
      esp32: 'ESP32 Microcontroller',
      // Legacy
      turbidity: 'Turbidity Sensor',
      ph: 'pH Sensor',
      flowRate: 'Flow Rate Sensor',
      motion: 'Motion Detector',
      pressure: 'Pressure Sensor',
      light: 'Light Sensor',
    },
  },
};

let currentLanguage: Language = 'en';

/**
 * Set the current language (legacy - use LanguageContext instead)
 */
export function setLanguage(lang: Language) {
  currentLanguage = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
    localStorage.setItem('languageTimestamp', new Date().toISOString());
  }
}

/**
 * Get the current language (legacy - use useLanguage hook instead)
 */
export function getLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('language') as Language;
    if (stored && (stored === 'en' || stored === 'mg' || stored === 'tdx')) {
      return stored;
    }
  }
  return 'en';
}

/**
 * Get user language preference with auto-detection support
 */
export function getUserLanguagePreference(): Language {
  if (typeof window === 'undefined') return 'en';
  
  // Check localStorage first
  const saved = localStorage.getItem('language');
  if (saved && (saved === 'en' || saved === 'mg' || saved === 'tdx')) {
    return saved as Language;
  }
  
  // Auto-detect from browser language
  const browserLang = navigator.language?.split('-')[0].toLowerCase() || 'en';
  if (browserLang === 'mg') return 'mg';
  
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

/**
 * AI-enhanced translation helper - integrates with ai-translate.ts
 * Provides static translations first, then AI translation for dynamic content
 */
export async function tAI(key: string, lang?: Language): Promise<string> {
  // First try static translations
  const staticTranslation = t(key, lang);
  if (staticTranslation !== key) {
    return staticTranslation;
  }
  
  // If key not found, try AI translation (dynamic content)
  try {
    const { translateText } = await import('./ai-translate');
    const targetLang: 'en' | 'mg' = (lang === 'tdx' ? 'mg' : lang) || (currentLanguage === 'tdx' ? 'mg' : currentLanguage) as 'en' | 'mg';
    return await translateText(key, targetLang);
  } catch (error) {
    console.warn(`Failed to translate "${key}" with AI:`, error);
    return key;
  }
}

/**
 * Batch translate keys using AI
 * Useful for translating multiple UI strings at once
 */
export async function tBatch(keys: string[], lang?: Language): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  
  for (const key of keys) {
    results[key] = await tAI(key, lang);
  }
  
  return results;
}
