const Profile = require('../models/Profile');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Certification = require('../models/Certification');
const Achievement = require('../models/Achievement');

const calculatePortfolioStrength = async (userId) => {
  let score = 0;
  const breakdown = {
    profile: 0,
    skills: 0,
    projects: 0,
    certifications: 0,
    achievements: 0,
    evidence: 0,
    resume: 0,
  };

  // 1. Profile Completeness (max 15 points)
  const profile = await Profile.findOne({ user: userId });
  if (profile) {
    if (profile.fullName) breakdown.profile += 2;
    if (profile.professionalTitle) breakdown.profile += 3;
    if (profile.bio) breakdown.profile += 3;
    if (profile.githubUrl) breakdown.profile += 3;
    if (profile.linkedinUrl) breakdown.profile += 2;
    if (profile.college) breakdown.profile += 2;
  }
  breakdown.profile = Math.min(15, breakdown.profile);
  score += breakdown.profile;

  // 2. Resume (max 5 points)
  if (profile && profile.resumeUrl) {
    breakdown.resume = 5;
    score += breakdown.resume;
  }

  // 3. Skills (max 20 points)
  const skillsCount = await Skill.countDocuments({ user: userId });
  breakdown.skills = Math.min(20, skillsCount * 2); // 2 points per skill, up to 10 skills
  score += breakdown.skills;

  // 4. Projects (max 25 points)
  const projectsCount = await Project.countDocuments({ user: userId });
  breakdown.projects = Math.min(25, projectsCount * 5); // 5 points per project, up to 5 projects
  score += breakdown.projects;

  // 5. Certifications (max 15 points)
  const certsCount = await Certification.countDocuments({ user: userId });
  breakdown.certifications = Math.min(15, certsCount * 3); // 3 points per cert, up to 5 certs
  score += breakdown.certifications;

  // 6. Achievements (max 10 points)
  const achievementsCount = await Achievement.countDocuments({ user: userId });
  breakdown.achievements = Math.min(10, achievementsCount * 2); // 2 points per achievement, up to 5 achievements
  score += breakdown.achievements;

  // 7. Evidence linking (max 10 points)
  const skillsWithEvidence = await Skill.find({ 
    user: userId, 
    $or: [
      { projects: { $exists: true, $not: { $size: 0 } } },
      { certifications: { $exists: true, $not: { $size: 0 } } }
    ]
  }).countDocuments();
  breakdown.evidence = Math.min(10, skillsWithEvidence * 2); // 2 points per skill with evidence
  score += breakdown.evidence;

  return {
    score,
    breakdown
  };
};

module.exports = {
  calculatePortfolioStrength
};
