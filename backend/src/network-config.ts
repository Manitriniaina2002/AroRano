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

function isVercelOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return url.hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

export function getAllowedOrigins(): string[] {
  const sources = [process.env.CORS_ORIGINS, process.env.FRONTEND_URL]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(',');

  return parseOrigins(sources);
}

function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Allow Vercel deployment domains by default unless explicitly disabled.
  const allowVercelOrigins = process.env.ALLOW_VERCEL_ORIGINS !== 'false';
  return allowVercelOrigins && isVercelOrigin(origin);
}

function createCorsOriginValidator(allowedOrigins: string[]) {
  return (origin: string | undefined, callback: (error: Error | null, allow?: boolean | string) => void) => {
    // Allow non-browser clients that do not send an Origin header.
    if (!origin) {
      callback(null, true);
      return;
    }

    if (isOriginAllowed(origin, allowedOrigins)) {
      callback(null, origin);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  };
}

export function getHttpCorsOptions() {
  const allowedOrigins = getAllowedOrigins();

  return {
    origin: createCorsOriginValidator(allowedOrigins),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  };
}

export function getWebSocketCorsOptions() {
  const allowedOrigins = getAllowedOrigins();

  return {
    origin: createCorsOriginValidator(allowedOrigins),
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
