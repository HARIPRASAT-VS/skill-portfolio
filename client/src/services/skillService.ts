import apiClient from './apiClient';
import { Skill } from '../types';

export const skillService = {
  getSkills: (): Promise<{success: boolean, data: Skill[]}> => {
    return apiClient.get('/skills');
  },
  
  createSkill: (data: Omit<Skill, 'id'>): Promise<{success: boolean, data: Skill}> => {
    return apiClient.post('/skills', data);
  },
  
  updateSkill: (id: string, data: Partial<Skill>): Promise<{success: boolean, data: Skill}> => {
    return apiClient.put(`/skills/${id}`, data);
  },
  
  deleteSkill: (id: string): Promise<{success: boolean}> => {
    return apiClient.delete(`/skills/${id}`);
  }
};
