import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PortfolioData, Skill, Project, Certification, Achievement, Profile } from '../types';
import apiClient from '../services/apiClient';

interface PortfolioState extends PortfolioData {
  fetchData: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
  addSkill: (skill: Omit<Skill, 'id'>) => Promise<void>;
  updateSkill: (id: string, skill: Partial<Skill>) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addCertification: (cert: Omit<Certification, 'id'>) => Promise<void>;
  updateCertification: (id: string, cert: Partial<Certification>) => Promise<void>;
  deleteCertification: (id: string) => Promise<void>;
  addAchievement: (achievement: Omit<Achievement, 'id'>) => Promise<void>;
  updateAchievement: (id: string, achievement: Partial<Achievement>) => Promise<void>;
  deleteAchievement: (id: string) => Promise<void>;
  toggleSkillVisibility: (id: string) => Promise<void>;
  toggleProjectVisibility: (id: string) => Promise<void>;
  toggleFeaturedProject: (id: string) => Promise<void>;
  addEvidence: (skillId: string, evidence: {projects?: string[], certifications?: string[]}) => Promise<void>;
  removeEvidence: (skillId: string, evidence: {projects?: string[], certifications?: string[]}) => Promise<void>;
}

const emptyData: PortfolioData = {
  profile: {
    id: '', fullName: '', title: '', email: '', phone: '', location: '', college: '', degree: '',
    graduationYear: '', academicYear: '', bio: '', summary: '', careerGoal: '', github: '',
    linkedin: '', portfolio: '', openToOpportunities: false, interests: []
  } as Profile,
  skills: [],
  projects: [],
  certifications: [],
  achievements: [],
  analytics: null
};

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      ...emptyData,
      fetchData: async () => {
        try {
          const [profile, skills, projects, certifications, achievements, analytics] = await Promise.all([
            apiClient.get('/profile').then((r: any) => r.data).catch(() => ({})),
            apiClient.get('/skills').then((r: any) => r.data).catch(() => []),
            apiClient.get('/projects').then((r: any) => r.data).catch(() => []),
            apiClient.get('/certifications').then((r: any) => r.data).catch(() => []),
            apiClient.get('/achievements').then((r: any) => r.data).catch(() => []),
            apiClient.get('/analytics').then((r: any) => r.data).catch(() => null)
          ]);
          set({ profile, skills, projects, certifications, achievements, analytics });
        } catch (error) {
          console.error("Failed to fetch portfolio data", error);
        }
      },
      updateProfile: async (updates) => {
        const res = await apiClient.put('/profile', updates) as any;
        set({ profile: res.data });
      },
      addSkill: async (skill) => {
        const res = await apiClient.post('/skills', skill) as any;
        const analyticsRes = await apiClient.get('/analytics') as any;
        set((state) => ({ skills: [res.data, ...state.skills], analytics: analyticsRes.data }));
      },
      updateSkill: async (id, updates) => {
        const res = await apiClient.put(`/skills/${id}`, updates) as any;
        const analyticsRes = await apiClient.get('/analytics') as any;
        set((state) => ({ skills: state.skills.map(s => (s as any)._id === id || s.id === id ? res.data : s), analytics: analyticsRes.data }));
      },
      deleteSkill: async (id) => {
        await apiClient.delete(`/skills/${id}`);
        const analyticsRes = await apiClient.get('/analytics') as any;
        set((state) => ({ skills: state.skills.filter(s => (s as any)._id !== id && s.id !== id), analytics: analyticsRes.data }));
      },
      addProject: async (project) => {
        const res = await apiClient.post('/projects', project) as any;
        const analyticsRes = await apiClient.get('/analytics') as any;
        set((state) => ({ projects: [res.data, ...state.projects], analytics: analyticsRes.data }));
      },
      updateProject: async (id, updates) => {
        const res = await apiClient.put(`/projects/${id}`, updates) as any;
        const analyticsRes = await apiClient.get('/analytics') as any;
        set((state) => ({ projects: state.projects.map(p => (p as any)._id === id || p.id === id ? res.data : p), analytics: analyticsRes.data }));
      },
      deleteProject: async (id) => {
        await apiClient.delete(`/projects/${id}`);
        const analyticsRes = await apiClient.get('/analytics') as any;
        set((state) => ({ projects: state.projects.filter(p => (p as any)._id !== id && p.id !== id), analytics: analyticsRes.data }));
      },
      addCertification: async (cert) => {
        const res = await apiClient.post('/certifications', cert) as any;
        const analyticsRes = await apiClient.get('/analytics') as any;
        set((state) => ({ certifications: [res.data, ...state.certifications], analytics: analyticsRes.data }));
      },
      updateCertification: async (id, updates) => {
        const res = await apiClient.put(`/certifications/${id}`, updates) as any;
        const analyticsRes = await apiClient.get('/analytics') as any;
        set((state) => ({ certifications: state.certifications.map(c => (c as any)._id === id || c.id === id ? res.data : c), analytics: analyticsRes.data }));
      },
      deleteCertification: async (id) => {
        await apiClient.delete(`/certifications/${id}`);
        const analyticsRes = await apiClient.get('/analytics') as any;
        set((state) => ({ certifications: state.certifications.filter(c => (c as any)._id !== id && c.id !== id), analytics: analyticsRes.data }));
      },
      addAchievement: async (achievement) => {
        const res = await apiClient.post('/achievements', achievement) as any;
        const analyticsRes = await apiClient.get('/analytics') as any;
        set((state) => ({ achievements: [res.data, ...state.achievements], analytics: analyticsRes.data }));
      },
      updateAchievement: async (id, updates) => {
        const res = await apiClient.put(`/achievements/${id}`, updates) as any;
        const analyticsRes = await apiClient.get('/analytics') as any;
        set((state) => ({ achievements: state.achievements.map(a => (a as any)._id === id || a.id === id ? res.data : a), analytics: analyticsRes.data }));
      },
      deleteAchievement: async (id) => {
        await apiClient.delete(`/achievements/${id}`);
        const analyticsRes = await apiClient.get('/analytics') as any;
        set((state) => ({ achievements: state.achievements.filter(a => (a as any)._id !== id && a.id !== id), analytics: analyticsRes.data }));
      },
      toggleSkillVisibility: async (_id) => {},
      toggleProjectVisibility: async (_id) => {},
      toggleFeaturedProject: async (_id) => {},
      addEvidence: async (_skillId, _evidence) => {},
      removeEvidence: async (_skillId, _evidence) => {}
    }),
    {
      name: 'skillfolio-storage',
      partialize: (state) => ({ profile: state.profile }) // Only persist profile locally if needed
    }
  )
);
