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
    recommendations.push("Add more projects to demonstrate practical experience.");
  }

  if (skillsWithoutEvidence.length > 0) {
    recommendations.push(`Add evidence for your ${skillsWithoutEvidence[0].name} skill.`);
  }

  if (profile) {
    if (!profile.githubUrl) {
      recommendations.push("Add your GitHub profile.");
    }
    if (!profile.resumeUrl) {
      recommendations.push("Upload your resume.");
    }
    if (!profile.bio) {
      recommendations.push("Complete your professional summary.");
    }
  }

  return recommendations;
};

module.exports = {
  generateRecommendations
};
