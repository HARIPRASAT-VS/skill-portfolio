import apiClient from './apiClient';
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth';

export const authService = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiClient.post('/auth/login', credentials);
  },
  
  register: (credentials: RegisterCredentials): Promise<AuthResponse> => {
    return apiClient.post('/auth/register', credentials);
  },
  
  logout: (): Promise<{success: boolean, message: string}> => {
    return apiClient.post('/auth/logout');
  },
  
  getCurrentUser: (): Promise<{success: boolean, data: User}> => {
    return apiClient.get('/auth/me');
  }
};
