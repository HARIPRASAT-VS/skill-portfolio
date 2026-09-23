import apiClient from './apiClient';
import { Project, Certification, Achievement } from '../types';

export const projectService = {
  getProjects: (): Promise<{success: boolean, data: Project[]}> => {
    return apiClient.get('/projects');
  },
  createProject: (data: Omit<Project, 'id'>): Promise<{success: boolean, data: Project}> => {
    return apiClient.post('/projects', data);
  },
  updateProject: (id: string, data: Partial<Project>): Promise<{success: boolean, data: Project}> => {
    return apiClient.put(`/projects/${id}`, data);
  },
  deleteProject: (id: string): Promise<{success: boolean}> => {
    return apiClient.delete(`/projects/${id}`);
  }
};

export const certificationService = {
  getCertifications: (): Promise<{success: boolean, data: Certification[]}> => {
    return apiClient.get('/certifications');
  },
  createCertification: (data: Omit<Certification, 'id'>): Promise<{success: boolean, data: Certification}> => {
    return apiClient.post('/certifications', data);
  },
  updateCertification: (id: string, data: Partial<Certification>): Promise<{success: boolean, data: Certification}> => {
    return apiClient.put(`/certifications/${id}`, data);
  },
  deleteCertification: (id: string): Promise<{success: boolean}> => {
    return apiClient.delete(`/certifications/${id}`);
  }
};

export const achievementService = {
  getAchievements: (): Promise<{success: boolean, data: Achievement[]}> => {
    return apiClient.get('/achievements');
  },
  createAchievement: (data: Omit<Achievement, 'id'>): Promise<{success: boolean, data: Achievement}> => {
    return apiClient.post('/achievements', data);
  },
  updateAchievement: (id: string, data: Partial<Achievement>): Promise<{success: boolean, data: Achievement}> => {
    return apiClient.put(`/achievements/${id}`, data);
  },
  deleteAchievement: (id: string): Promise<{success: boolean}> => {
    return apiClient.delete(`/achievements/${id}`);
  }
};
