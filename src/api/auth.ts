/* ── Auth API ── */
import { post } from './client';
import type { AuthResponse, LoginRequest, RefreshTokenRequest } from './types';

export const authApi = {
  login: (data: LoginRequest) =>
    post<AuthResponse>('/auth/login', data),

  refresh: (data: RefreshTokenRequest) =>
    post<AuthResponse>('/auth/refresh', data),
};
