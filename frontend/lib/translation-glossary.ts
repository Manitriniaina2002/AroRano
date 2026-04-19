export interface GlossaryEntry {
  translated: string;
  confidence: number;
}

const GLOSSARY: Record<string, GlossaryEntry> = {
  'loading...': { translated: 'Miandry...', confidence: 0.99 },
  error: { translated: 'Hadisoana', confidence: 0.99 },
  success: { translated: 'Nahomby', confidence: 0.99 },
  cancel: { translated: 'Ajanona', confidence: 0.96 },
  add: { translated: 'Ampio', confidence: 0.95 },
  delete: { translated: 'Fafao', confidence: 0.95 },
  edit: { translated: 'Ovao', confidence: 0.95 },
  save: { translated: 'Tehirizo', confidence: 0.95 },
  close: { translated: 'Akatona', confidence: 0.95 },
  connected: { translated: 'Mifandray', confidence: 0.98 },
  disconnected: { translated: 'Tsy mifandray', confidence: 0.98 },
  status: { translated: 'Toe-javatra', confidence: 0.97 },
  type: { translated: 'Karazana', confidence: 0.96 },
  location: { translated: 'Toerana', confidence: 0.96 },
  name: { translated: 'Anarana', confidence: 0.96 },
  value: { translated: 'Sanda', confidence: 0.96 },
  unit: { translated: 'Singa', confidence: 0.95 },
  latest: { translated: 'Farany indrindra', confidence: 0.96 },
  average: { translated: 'Salan\'isa', confidence: 0.94 },
  minimum: { translated: 'Kely indrindra', confidence: 0.97 },
  maximum: { translated: 'Lehibe indrindra', confidence: 0.97 },
  dashboard: { translated: 'Takelaka fanaraha-maso', confidence: 0.96 },
  devices: { translated: 'Fitaovana', confidence: 0.97 },
  device: { translated: 'Fitaovana', confidence: 0.97 },
  readings: { translated: 'Vakiteny', confidence: 0.96 },
  reading: { translated: 'Vakiteny', confidence: 0.96 },
  alerts: { translated: 'Fampitandremana', confidence: 0.98 },
  settings: { translated: 'Fikirana', confidence: 0.97 },
  language: { translated: 'Fiteny', confidence: 0.97 },
  refresh: { translated: 'Havaozy', confidence: 0.96 },
  search: { translated: 'Tadiavo', confidence: 0.96 },
  filter: { translated: 'Sivana', confidence: 0.96 },
  export: { translated: 'Aondrana', confidence: 0.95 },
  back: { translated: 'Miverena', confidence: 0.95 },
  home: { translated: 'Fandraisana', confidence: 0.97 },
  water: { translated: 'Rano', confidence: 0.99 },
  rain: { translated: 'Orana', confidence: 0.98 },
  temperature: { translated: 'Hafanana', confidence: 0.95 },
  humidity: { translated: 'Hamandoana', confidence: 0.95 },
  sensor: { translated: 'sensor', confidence: 0.2 },
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

export function lookupGlossary(term: string): GlossaryEntry | null {
  return GLOSSARY[normalizeKey(term)] || null;
}

export function getGlossaryKeys(): string[] {
  return Object.keys(GLOSSARY);
}