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
      loading: 'Miandry...',
      error: 'Fahadisoana',
      success: 'Mahomby',
      cancel: 'Fatsoina',
      add: 'Manampy',
      delete: 'Hoafaho',
      edit: 'Hanova-kevitra',
      save: 'Hitahiry',
      close: 'Hanakatso',
      connected: 'Mifandray',
      disconnected: 'Tsy mifandray',
      status: 'Toetran\'',
      type: 'Karazana',
      location: 'Fitoerana',
      name: 'Anarana',
      value: 'Lanjany',
      unit: 'Haben\'ny fandrefesana',
      latest: 'Farany',
      average: 'Salan\'-karaha',
      minimum: 'Sela kely indrindra',
      maximum: 'Habetry ny hoditra',
      justNow: 'Vao hatsingana',
    },
    home: {
      title: 'AroRano',
      subtitle: 'Plataporma fitantanana sy fanaraha-maoña ny tsoramahazo IoT',
      welcome: 'Taloha soa! Tonga soa taminao.',
      serverStatus: 'Toetran\'ny serbisy',
      dashboard: 'Fatora fahita ny tsoramahazo',
      dashboardDescription: 'Tanantanin\'ny tsoramahazo IoT, hijery ny sanda vakitry ny fitoeram-pahalalana, ary araka ny statistikan\'ny fampiasana.',
      goToDashboard: 'Mandalo amin\'ny fatora fahita',
    },
    dashboard: {
      title: 'Fatora fahita ny tsoramahazo',
      devices: 'Tsoramahazo',
      deviceCount: 'Tsoramahazo ({count})',
      noDevices: 'Tsy misy tsoramahazo mihitsy',
      addDevice: 'Manampy tsoramahazo vaovao',
      cancelAdd: 'Fatsoina',
      deviceName: 'Anarana ny tsoramahazo',
      selectType: 'Fidio ny karazana ny tsoramahazo',
      location: 'Fitoerana',
      createDevice: 'Manao tsoramahazo',
      deleteDevice: 'Hoafaho ny tsoramahazo',
      confirmDelete: 'Hazo antoka ve ianao fa hoafaho io tsoramahazo io?',
      selectDevice: 'Fidio tsoramahazo iray raha hijery ny antsipiriany',
      statistics: 'Statistika',
      liveReadings: 'Vakitry ny miparitaka',
      noReadings: 'Tsy misy vakitry elaeo',
      temperature: 'Hafanana',
      humidity: 'Taorampohon\'ny afovoan',
      motion: 'Fihetsikan\'ny zavatra',
      pressure: 'Fanerena',
      light: 'Jiro',
      websocketStatus: 'Toetran\'ny mifandray',
      websocketConnected: 'Mifandray tsara',
      websocketDisconnected: 'Tsy mifandray',
    },
    deviceTypes: {
      temperature: 'Fandrefesana hafanana',
      humidity: 'Fandrefesana taorampohon\'ny afovoan',
      motion: 'Mpamantatra ny fihetsikan\'ny zavatra',
      pressure: 'Fandrefesana fanerena',
      light: 'Fandrefesana jiro',
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
