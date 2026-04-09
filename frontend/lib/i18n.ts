export type Language = 'en' | 'mg';

export const translations = {
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
      loading: 'Mandoatra...',
      error: 'Diso',
      success: 'Nahomby',
      cancel: 'Ayoina',
      add: 'Ampiditra',
      delete: 'Afaho',
      edit: 'Hanova',
      save: 'Safidy',
      close: 'Mahinda',
      connected: 'Tafiditra',
      disconnected: 'Misaraka',
      status: 'Toetran\'ny',
      type: 'Karazana',
      location: 'Toera',
      name: 'Anarana',
      value: 'Lanjany',
      unit: 'Singa',
      latest: 'Farany indrindra',
      average: 'Salan\'isa',
      minimum: 'Kely indrindra',
      maximum: 'Be indrindra',
    },
    home: {
      title: 'AroRano',
      subtitle: 'Plataporma fitantanana sy fanaraha-maoña ny fitaovam-pifidianana IoT',
      welcome: 'Hafaozana momba ny Fialofana',
      serverStatus: 'Toetran\'ny Tora',
      dashboard: 'Dashboard Fanaraha-maoña IoT',
      dashboardDescription: 'Fitantanana sy fanaraha-maoña ny fitaovam-pifidianana IoT nifidianana, hijery ny vakitry ny sensor, ary araka ny statistika ny fitaovam-pifidianana.',
      goToDashboard: 'Mandalo ho amin\'ny Dashboard',
    },
    dashboard: {
      title: 'Dashboard Fanaraha-maoña IoT',
      devices: 'Fitaovam-pifidianana',
      deviceCount: 'Fitaovam-pifidianana ({count})',
      noDevices: 'Tsy misy fitaovam-pifidianana pa',
      addDevice: 'Ampiditra fitaovam-pifidianana',
      cancelAdd: 'Ayoina',
      deviceName: 'Anarana ny fitaovam-pifidianana',
      selectType: 'Safidio ny karazana ny fitaovam-pifidianana',
      location: 'Toera',
      createDevice: 'Lumikha fitaovam-pifidianana',
      deleteDevice: 'Afaho fitaovam-pifidianana',
      confirmDelete: 'Azo antoka ve ianao fa afaho io fitaovam-pifidianana io?',
      selectDevice: 'Safidio fitaovam-pifidianana iray mba hijery ny fampahalalana',
      statistics: 'Statistika',
      liveReadings: 'Vakitry ny Manatsotra',
      noReadings: 'Tsy misy vakitry pa',
      justNow: 'Nony vao',
      temperature: 'Temperature',
      humidity: 'Moisture',
      motion: 'Motion',
      pressure: 'Pressure',
      light: 'Light',
      websocketStatus: 'Toetran\'ny WebSocket',
      websocketConnected: 'WebSocket Tafiditra',
      websocketDisconnected: 'WebSocket Misaraka',
    },
    deviceTypes: {
      temperature: 'Sensor Temperature',
      humidity: 'Sensor Moisture',
      motion: 'Detector Motion',
      pressure: 'Sensor Pressure',
      light: 'Sensor Light',
    },
  },
};

let currentLanguage: Language = 'en';

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
  }
}

export function getLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('language') as Language;
    if (stored) return stored;
  }
  return 'en';
}

export function getCurrentLanguage(): Language {
  return currentLanguage;
}

export function t(key: string, lang?: Language): string {
  const language = lang || currentLanguage;
  const keys = key.split('.');
  let value: any = translations[language];

  for (const k of keys) {
    value = value?.[k];
  }

  if (!value) {
    const fallback = translations.en;
    value = fallback;
    for (const k of keys) {
      value = value?.[k];
    }
  }

  return value || key;
}

// Initialize language from localStorage on client side
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('language') as Language;
  if (stored) {
    currentLanguage = stored;
  } else {
    // Try to detect browser language
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    currentLanguage = browserLang === 'mg' ? 'mg' : 'en';
    localStorage.setItem('language', currentLanguage);
  }
}
