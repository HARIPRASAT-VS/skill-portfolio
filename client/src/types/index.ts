export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type SkillCategory =
  | 'Programming'
  | 'Frontend'
  | 'Backend'
  | 'Database'
  | 'Cloud'
  | 'DevOps'
  | 'AI/ML'
  | 'Tools'
  | 'Soft Skills';

export interface Profile {
  id: string;
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  college: string;
  degree: string;
  graduationYear: string;
  academicYear: string;
  bio: string;
  summary: string;
  careerGoal: string;
  github: string;
  linkedin: string;
  portfolio: string;
  openToOpportunities: boolean;
  interests: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  progress: number;
  yearsOfExperience: string;
  description?: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  category: string;
  role: string;
  teamSize: string;
  duration: string;
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
  status?: 'Completed' | 'In Progress' | 'Archived';
  isPublic?: boolean;
  relatedSkillIds: string[]; // Links to skills
  createdAt: string;
  updatedAt: string;
}

export interface Certification {
  id: string;
  title: string;
  organization: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
  certificateUrl: string;
  relatedSkillIds: string[]; // Links to skills
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  organization: string;
  description: string;
  date: string;
  category: string;
  image?: string;
  isPublic?: boolean;
  relatedSkillIds: string[]; // Links to skills
  relatedProjectIds?: string[]; // Links to projects
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioData {
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  achievements: Achievement[];
}
