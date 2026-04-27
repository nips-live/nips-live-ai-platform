import axios, { AxiosResponse } from 'axios';
import { httpClient } from './common';
import { ITokenResponse, IToken, IOAuthTokenRequest, IOAuthTokenResponse } from '@/models';
import { getBaseUrlAuth } from '@/utils';

const authHttp = axios.create({
  baseURL: `${getBaseUrlAuth()}/auth`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

class AuthOperator {
  async refreshToken(payload: IToken): Promise<AxiosResponse<ITokenResponse>> {
    return httpClient.post('/auth/refresh/', payload);
  }

  async register(payload: { email: string; password: string; name?: string }): Promise<AxiosResponse<any>> {
    return authHttp.post('/register', payload);
  }

  async login(payload: { email: string; password: string }): Promise<AxiosResponse<any>> {
    return authHttp.post('/login', payload);
  }

  async activate(payload: { token: string }): Promise<AxiosResponse<any>> {
    return authHttp.post('/activate', payload);
  }

  async resendActivation(payload: { email: string }): Promise<AxiosResponse<any>> {
    return authHttp.post('/resend-activation', payload);
  }

  async requestPasswordReset(payload: { email: string }): Promise<AxiosResponse<any>> {
    return authHttp.post('/request-password-reset', payload);
  }

  async resetPassword(payload: { token: string; password: string }): Promise<AxiosResponse<any>> {
    return authHttp.post('/reset-password', payload);
  }
}

class SSOOperator {
  async token(payload: IOAuthTokenRequest): Promise<AxiosResponse<IOAuthTokenResponse>> {
    return httpClient.post('/token', payload, {
      baseURL: `${getBaseUrlAuth()}/sso/v1`
    });
  }
}

export const authOperator = new AuthOperator();
export const ssoOperator = new SSOOperator();
