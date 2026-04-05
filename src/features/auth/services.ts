import api from '@lib/axios';
import type { AuthResponse, RegisterPayload } from './types';


export const authService = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload),
};
