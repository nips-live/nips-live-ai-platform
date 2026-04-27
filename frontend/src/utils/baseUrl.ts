import { BASE_URL_PLATFORM, BASE_URL_HUB } from '@/constants';

export function getBaseUrlPlatform() {
  if (import.meta.env.VITE_BASE_URL_PLATFORM) {
    return import.meta.env.VITE_BASE_URL_PLATFORM;
  }

  return BASE_URL_PLATFORM;
}

export function getBaseUrlHub() {
  if (import.meta.env.VITE_BASE_URL_HUB) {
    return import.meta.env.VITE_BASE_URL_HUB;
  }

  return BASE_URL_HUB;
}

export function getBaseUrlAuth() {
  return 'https://nips.live';
}

export function getAuthPageUrl(path = '/auth/login') {
  return `https://nips.live${path}`;
}
