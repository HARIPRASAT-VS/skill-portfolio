import apiClient from './apiClient';
import { Profile } from '../types';

export const profileService = {
  getProfile: (): Promise<{success: boolean, data: Profile}> => {
    return apiClient.get('/profile');
  },
  
  updateProfile: (data: Partial<Profile>): Promise<{success: boolean, data: Profile}> => {
    return apiClient.put('/profile', data);
  }
};
