const DEFAULT_SITE_URL = 'https://arorano.vercel.app';

function sanitizeSiteUrl(value: string) {
  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return value.replace(/\/$/, '');
  }
}

export function getSiteUrl() {
  return sanitizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL);
}

export function getCanonicalUrl(pathname = '/') {
  return new URL(pathname, getSiteUrl()).toString();
}