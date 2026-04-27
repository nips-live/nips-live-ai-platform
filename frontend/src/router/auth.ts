import {
  ROUTE_AUTH_ACTIVATE,
  ROUTE_AUTH_CALLBACK,
  ROUTE_AUTH_FORGOT_PASSWORD,
  ROUTE_AUTH_LOGIN,
  ROUTE_AUTH_REGISTER,
  ROUTE_AUTH_RESET_PASSWORD
} from './constants';

export default {
  path: '/auth',
  component: () => import('@/layouts/Auth.vue'),
  children: [
    {
      path: 'login',
      name: ROUTE_AUTH_LOGIN,
      component: () => import('@/pages/auth/Login.vue')
    },
    {
      path: 'register',
      name: ROUTE_AUTH_REGISTER,
      component: () => import('@/pages/auth/Register.vue')
    },
    {
      path: 'forgot-password',
      name: ROUTE_AUTH_FORGOT_PASSWORD,
      component: () => import('@/pages/auth/ForgotPassword.vue')
    },
    {
      path: 'reset-password',
      name: ROUTE_AUTH_RESET_PASSWORD,
      component: () => import('@/pages/auth/ResetPassword.vue')
    },
    {
      path: 'activate',
      name: ROUTE_AUTH_ACTIVATE,
      component: () => import('@/pages/auth/Activate.vue')
    },
    {
      path: 'callback',
      name: ROUTE_AUTH_CALLBACK,
      component: () => import('@/pages/auth/Callback.vue')
    }
  ]
};
