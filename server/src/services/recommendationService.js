const Profile = require('../models/Profile');
const Skill = require('../models/Skill');
const Project = require('../models/Project');

const generateRecommendations = async (userId) => {
  const recommendations = [];

  const profile = await Profile.findOne({ user: userId });
  const projectsCount = await Project.countDocuments({ user: userId });
  
  // Skills without evidence
  const skillsWithoutEvidence = await Skill.find({ 
    user: userId,
    projects: { $size: 0 },
    certifications: { $size: 0 }
  });

  if (projectsCount < 3) {
    recommendations.push({
      id: 'rec-projects',
      title: 'Add Projects',
      message: 'Add more projects to demonstrate practical experience.',
      actionText: 'Add Project',
      actionLink: '/dashboard/projects?action=new'
    });
  }

  if (skillsWithoutEvidence.length > 0) {
    recommendations.push({
      id: 'rec-evidence',
      title: 'Link Evidence',
      message: `Add evidence for your ${skillsWithoutEvidence[0].name} skill.`,
      actionText: 'Add Evidence',
      actionLink: '/dashboard/skills'
    });
  }

  if (profile) {
    if (!profile.githubUrl) {
      recommendations.push({
        id: 'rec-github',
        title: 'Add GitHub',
        message: 'Add your GitHub profile.',
        actionText: 'Edit Profile',
        actionLink: '/dashboard/profile'
      });
    }
    if (!profile.resumeUrl) {
      recommendations.push({
        id: 'rec-resume',
        title: 'Upload Resume',
        message: 'Upload your resume.',
        actionText: 'Edit Profile',
        actionLink: '/dashboard/profile'
      });
    }
    if (!profile.bio) {
      recommendations.push({
        id: 'rec-bio',
        title: 'Complete Bio',
        message: 'Complete your professional summary.',
        actionText: 'Edit Profile',
        actionLink: '/dashboard/profile'
      });
    }
  }

  return recommendations;
};

module.exports = {
  generateRecommendations
};
