import router from '@/router';

type LoginRedirectOptions = {
  redirect?: string;
  site?: string;
};

function safeRedirectPath(input?: string | LoginRedirectOptions) {
  const raw = typeof input === 'string' ? input : input?.redirect;

  if (!raw) {
    return '/';
  }

  if (raw.includes('api.nips.live') || raw.includes('auth.acedata.cloud') || raw.includes('/auth/logout')) {
    return '/';
  }

  try {
    const parsed = new URL(raw, window.location.origin);

    if (parsed.hostname !== window.location.hostname) {
      return '/';
    }

    if (parsed.pathname.startsWith('/auth/logout')) {
      return '/';
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return raw.startsWith('/') ? raw : '/';
  }
}

export function login() {
  router.push('/auth/login');
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('Authorization');
  localStorage.removeItem('user');
  sessionStorage.removeItem('nips_login_redirect');
  router.push('/auth/login');
}

export function redirectToLogin() {
  router.push('/auth/login');
}

export function getLoginUrl() {
  return '/auth/login';
}

export function loginRedirect(input?: string | LoginRedirectOptions) {
  const target = safeRedirectPath(input);

  if (target && target !== '/auth/login') {
    sessionStorage.setItem('nips_login_redirect', target);
  }

  router.push('/auth/login');
}

export function logoutRedirect() {
  logout();
}
