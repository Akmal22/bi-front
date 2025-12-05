import { apiClient } from './client';
import type { LoginRequest, LoginResponse } from '../types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth', credentials);
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<LoginResponse> => {
    return apiClient.get<LoginResponse>('/auth/current');
  },
};
