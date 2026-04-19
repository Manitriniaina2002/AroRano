const DEFAULT_API_PORT = '3001';
const DEFAULT_API_ORIGIN = `http://localhost:${DEFAULT_API_PORT}`;

function isLoopbackHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function getBrowserDefaultApiOrigin() {
  if (typeof window === 'undefined') {
    return DEFAULT_API_ORIGIN;
  }

  return `${window.location.protocol}//${window.location.hostname}:${DEFAULT_API_PORT}`;
}

function sanitizeApiOrigin(value: string) {
  try {
    const url = new URL(value);

    // Accept either http://host:3001 or http://host:3001/api in env values.
    url.pathname = url.pathname.replace(/\/api\/?$/, '').replace(/\/$/, '');

    if (typeof window !== 'undefined' && isLoopbackHost(url.hostname) && !isLoopbackHost(window.location.hostname)) {
      url.hostname = window.location.hostname;
    }

    return url.toString().replace(/\/$/, '');
  } catch {
    return value.replace(/\/api\/?$/, '').replace(/\/$/, '');
  }
}

export function getApiOrigin() {
  const configuredOrigin = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!configuredOrigin) {
    return getBrowserDefaultApiOrigin();
  }

  return sanitizeApiOrigin(configuredOrigin);
}
