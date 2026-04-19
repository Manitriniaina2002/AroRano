import * as os from 'os';

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

function parseOrigins(value?: string): string[] {
  if (!value?.trim()) {
    return DEFAULT_CORS_ORIGINS;
  }

  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length ? origins : DEFAULT_CORS_ORIGINS;
}

export function getAllowedOrigins(): string[] {
  return parseOrigins(process.env.CORS_ORIGINS || process.env.FRONTEND_URL);
}

export function getHttpCorsOptions() {
  return {
    origin: getAllowedOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  };
}

export function getWebSocketCorsOptions() {
  return {
    origin: getAllowedOrigins(),
    credentials: true,
  };
}

export function getListenHost(): string {
  return process.env.HOST || '0.0.0.0';
}

export function getPrimaryLocalIp(): string {
  const interfaces = os.networkInterfaces();

  for (const networkInterface of Object.values(interfaces)) {
    for (const address of networkInterface || []) {
      if (address.family === 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }

  return 'localhost';
}
