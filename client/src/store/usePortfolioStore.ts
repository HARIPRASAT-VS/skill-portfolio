import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PortfolioData, Skill, Project, Certification, Achievement, Profile } from '../types';
import { initialMockData } from '../data/mockData';

interface PortfolioState extends PortfolioData {
  loadDemoData: () => void;
  resetDemo: () => void;
  updateProfile: (profile: Partial<Profile>) => void;
  addSkill: (skill: Skill) => void;
  updateSkill: (id: string, skill: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  toggleSkillVisibility: (id: string) => void;
  addEvidence: (skillId: string, itemIds: { projects?: string[], certifications?: string[], achievements?: string[] }) => void;
  removeEvidence: (skillId: string, itemIds: { projects?: string[], certifications?: string[], achievements?: string[] }) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  toggleProjectVisibility: (id: string) => void;
  toggleFeaturedProject: (id: string) => void;
  addCertification: (cert: Certification) => void;
  updateCertification: (id: string, cert: Partial<Certification>) => void;
  deleteCertification: (id: string) => void;
  addAchievement: (achievement: Achievement) => void;
  updateAchievement: (id: string, achievement: Partial<Achievement>) => void;
  deleteAchievement: (id: string) => void;
  toggleAchievementVisibility: (id: string) => void;
}

const emptyData: PortfolioData = {
  profile: {
    id: 'user-empty',
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    college: '',
    degree: '',
    graduationYear: '',
    academicYear: '',
    bio: '',
    summary: '',
    careerGoal: '',
    github: '',
    linkedin: '',
    portfolio: '',
    openToOpportunities: false,
    interests: []
  },
  skills: [],
  projects: [],
  certifications: [],
  achievements: []
};

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      ...emptyData,
      loadDemoData: () => set(initialMockData),
      resetDemo: () => set(emptyData),
      updateProfile: (profileUpdates) => set((state) => ({
        profile: { ...state.profile, ...profileUpdates }
      })),
      addSkill: (skill) => set((state) => ({ skills: [...state.skills, skill] })),
      updateSkill: (id, updates) => set((state) => ({
        skills: state.skills.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s)
      })),
      deleteSkill: (id) => set((state) => ({
        skills: state.skills.filter(s => s.id !== id),
        projects: state.projects.map(p => ({ ...p, relatedSkillIds: p.relatedSkillIds.filter(sid => sid !== id) })),
        certifications: state.certifications.map(c => ({ ...c, relatedSkillIds: c.relatedSkillIds.filter(sid => sid !== id) })),
        achievements: state.achievements.map(a => ({ ...a, relatedSkillIds: a.relatedSkillIds.filter(sid => sid !== id) }))
      })),
      toggleSkillVisibility: (id) => set((state) => ({
        skills: state.skills.map(s => s.id === id ? { ...s, isPublic: !s.isPublic, updatedAt: new Date().toISOString() } : s)
      })),
      addEvidence: (skillId, itemIds) => set((state) => ({
        projects: state.projects.map(p => itemIds.projects?.includes(p.id) && !p.relatedSkillIds.includes(skillId) 
          ? { ...p, relatedSkillIds: [...p.relatedSkillIds, skillId] } : p),
        certifications: state.certifications.map(c => itemIds.certifications?.includes(c.id) && !c.relatedSkillIds.includes(skillId) 
          ? { ...c, relatedSkillIds: [...c.relatedSkillIds, skillId] } : c),
        achievements: state.achievements.map(a => itemIds.achievements?.includes(a.id) && !a.relatedSkillIds.includes(skillId) 
          ? { ...a, relatedSkillIds: [...a.relatedSkillIds, skillId] } : a),
      })),
      removeEvidence: (skillId, itemIds) => set((state) => ({
        projects: state.projects.map(p => itemIds.projects?.includes(p.id) 
          ? { ...p, relatedSkillIds: p.relatedSkillIds.filter(id => id !== skillId) } : p),
        certifications: state.certifications.map(c => itemIds.certifications?.includes(c.id) 
          ? { ...c, relatedSkillIds: c.relatedSkillIds.filter(id => id !== skillId) } : c),
        achievements: state.achievements.map(a => itemIds.achievements?.includes(a.id) 
          ? { ...a, relatedSkillIds: a.relatedSkillIds.filter(id => id !== skillId) } : a),
      })),
      addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)
      })),
      deleteProject: (id) => set((state) => ({ 
        projects: state.projects.filter(p => p.id !== id),
        achievements: state.achievements.map(a => ({
          ...a,
          relatedProjectIds: a.relatedProjectIds?.filter(pid => pid !== id) || []
        }))
      })),
      toggleProjectVisibility: (id) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, isPublic: !p.isPublic, updatedAt: new Date().toISOString() } : p)
      })),
      toggleFeaturedProject: (id) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, featured: !p.featured, updatedAt: new Date().toISOString() } : p)
      })),
      addCertification: (cert) => set((state) => ({ certifications: [...state.certifications, cert] })),
      updateCertification: (id, updates) => set((state) => ({
        certifications: state.certifications.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)
      })),
      deleteCertification: (id) => set((state) => ({ certifications: state.certifications.filter(c => c.id !== id) })),
      addAchievement: (achievement) => set((state) => ({ achievements: [...state.achievements, achievement] })),
      updateAchievement: (id, updates) => set((state) => ({
        achievements: state.achievements.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a)
      })),
      deleteAchievement: (id) => set((state) => ({ achievements: state.achievements.filter(a => a.id !== id) })),
      toggleAchievementVisibility: (id) => set((state) => ({
        achievements: state.achievements.map(a => a.id === id ? { ...a, isPublic: !a.isPublic, updatedAt: new Date().toISOString() } : a)
      }))
    }),
    {
      name: 'skillfolio-storage',
    }
  )
);
