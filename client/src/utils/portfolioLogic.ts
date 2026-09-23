import type { PortfolioData } from '../types';

export interface Recommendation {
  id: string;
  title: string;
  message: string;
  actionText: string;
  actionLink: string;
}

export function calculatePortfolioStrength(data: PortfolioData): {
  total: number;
  breakdown: {
    profile: { complete: boolean; score: number };
    skills: { complete: boolean; score: number };
    projects: { complete: boolean; score: number };
    certifications: { complete: boolean; score: number };
    achievements: { complete: boolean; score: number };
    evidence: { complete: boolean; score: number };
    resume: { complete: boolean; score: number };
  }
} {
  let profileScore = 0;
  if (data.profile.fullName && data.profile.title && data.profile.bio && data.profile.college) {
    profileScore = 15;
  } else if (data.profile.fullName) {
    profileScore = 5;
  }

  const skillsScore = Math.min(20, (data.skills.length / 8) * 20);
  const projectsScore = Math.min(25, (data.projects.length / 4) * 25);
  const certificationsScore = Math.min(15, (data.certifications.length / 3) * 15);
  const achievementsScore = Math.min(10, (data.achievements.length / 3) * 10);
  
  // Evidence score logic: percentage of skills that are linked to at least one project or certification
  let evidenceScore = 0;
  if (data.skills.length > 0) {
    const skillsWithEvidence = data.skills.filter(s => 
      data.projects.some(p => p.relatedSkillIds.includes(s.id)) ||
      data.certifications.some(c => c.relatedSkillIds.includes(s.id)) ||
      data.achievements.some(a => a.relatedSkillIds.includes(s.id))
    );
    evidenceScore = Math.round((skillsWithEvidence.length / data.skills.length) * 10);
  }

  // Resume check - Assuming if fileText is empty or not in our dummy data, they didn't add it. Since we just have a button, we'll give 0 for now unless profile is complete (dummy logic)
  let resumeScore = 0; // We'll say 0 until they upload one. Wait, the mock says "Resume verification ○ Missing". So 0.

  const total = Math.round(profileScore + skillsScore + projectsScore + certificationsScore + achievementsScore + evidenceScore + resumeScore);

  return {
    total,
    breakdown: {
      profile: { complete: profileScore === 15, score: profileScore },
      skills: { complete: data.skills.length >= 8, score: Math.round(skillsScore) },
      projects: { complete: data.projects.length >= 4, score: Math.round(projectsScore) },
      certifications: { complete: data.certifications.length >= 3, score: Math.round(certificationsScore) },
      achievements: { complete: data.achievements.length >= 3, score: Math.round(achievementsScore) },
      evidence: { complete: evidenceScore === 10, score: evidenceScore },
      resume: { complete: resumeScore === 5, score: resumeScore }
    }
  };
}

export function generateRecommendations(data: PortfolioData): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Check for projects
  if (data.projects.length < 3) {
    recommendations.push({
      id: 'rec-1',
      title: 'Add more projects',
      message: 'Showcase your practical work by adding at least 3 projects.',
      actionText: 'Add Project',
      actionLink: '/dashboard/projects'
    });
  }

  // Check for skills without evidence
  const skillsWithoutEvidence = data.skills.filter(s => 
    !data.projects.some(p => p.relatedSkillIds.includes(s.id)) &&
    !data.certifications.some(c => c.relatedSkillIds.includes(s.id))
  );

  if (skillsWithoutEvidence.length > 0) {
    const skill = skillsWithoutEvidence[0];
    recommendations.push({
      id: 'rec-2',
      title: `Add a supporting project for ${skill.name}`,
      message: `Your ${skill.name} skill currently has no linked evidence.`,
      actionText: 'Add Project',
      actionLink: '/dashboard/projects'
    });
  }

  // Check resume
  recommendations.push({
    id: 'rec-3',
    title: 'Complete your resume',
    message: 'Your verified resume has not been uploaded yet.',
    actionText: 'Add Resume',
    actionLink: '/dashboard/profile'
  });

  // Check github
  if (!data.profile.github || data.profile.github.includes('Add GitHub')) {
    recommendations.push({
      id: 'rec-4',
      title: 'Add GitHub profile',
      message: 'Help recruiters explore your work directly.',
      actionText: 'Add GitHub',
      actionLink: '/dashboard/profile'
    });
  }

  // Check certification links
  const missingCreds = data.certifications.filter(c => !c.credentialUrl);
  if (missingCreds.length > 0) {
    recommendations.push({
      id: 'rec-5',
      title: 'Link certification evidence',
      message: `${missingCreds.length} certifications are missing credential links.`,
      actionText: 'Review Certifications',
      actionLink: '/dashboard/certifications'
    });
  }

  return recommendations;
}
