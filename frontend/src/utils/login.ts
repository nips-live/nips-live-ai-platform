import router from '@/router';

type LoginRedirectOptions = {
  redirect?: string;
  site?: string;
};

function currentPath() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function resolveRedirect(input?: string | LoginRedirectOptions) {
  if (typeof input === 'string') {
    return input;
  }

  if (input?.redirect) {
    return input.redirect;
  }

  return currentPath();
}

export function login() {
  router.push('/auth/login');
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('Authorization');
  localStorage.removeItem('user');
  router.push('/auth/login');
}

export function redirectToLogin() {
  router.push('/auth/login');
}

export function getLoginUrl() {
  return '/auth/login';
}

export function loginRedirect(input?: string | LoginRedirectOptions) {
  const target = resolveRedirect(input);

  if (target && target !== '/auth/login') {
    sessionStorage.setItem('nips_login_redirect', target);
  }

  router.push('/auth/login');
}
