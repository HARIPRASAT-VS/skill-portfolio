const Profile = require('../models/Profile');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Certification = require('../models/Certification');
const Achievement = require('../models/Achievement');

const calculatePortfolioStrength = async (userId) => {
  let score = 0;
  let profilePoints = 0;
  let resumePoints = 0;
  let skillsPoints = 0;
  let projectsPoints = 0;
  let certificationsPoints = 0;
  let achievementsPoints = 0;
  let evidencePoints = 0;

  // 1. Profile Completeness (max 15 points)
  const profile = await Profile.findOne({ user: userId });
  if (profile) {
    if (profile.fullName) profilePoints += 2;
    if (profile.professionalTitle) profilePoints += 3;
    if (profile.bio) profilePoints += 3;
    if (profile.githubUrl) profilePoints += 3;
    if (profile.linkedinUrl) profilePoints += 2;
    if (profile.college) profilePoints += 2;
  }
  profilePoints = Math.min(15, profilePoints);
  score += profilePoints;

  // 2. Resume (max 5 points)
  if (profile && profile.resumeUrl) {
    resumePoints = 5;
    score += resumePoints;
  }

  // 3. Skills (max 20 points)
  const skillsCount = await Skill.countDocuments({ user: userId });
  skillsPoints = Math.min(20, skillsCount * 2); // 2 points per skill, up to 10 skills
  score += skillsPoints;

  // 4. Projects (max 25 points)
  const projectsCount = await Project.countDocuments({ user: userId });
  projectsPoints = Math.min(25, projectsCount * 5); // 5 points per project, up to 5 projects
  score += projectsPoints;

  // 5. Certifications (max 15 points)
  const certsCount = await Certification.countDocuments({ user: userId });
  certificationsPoints = Math.min(15, certsCount * 3); // 3 points per cert, up to 5 certs
  score += certificationsPoints;

  // 6. Achievements (max 10 points)
  const achievementsCount = await Achievement.countDocuments({ user: userId });
  achievementsPoints = Math.min(10, achievementsCount * 2); // 2 points per achievement, up to 5 achievements
  score += achievementsPoints;

  // 7. Evidence linking (max 10 points)
  const skillsWithEvidence = await Skill.find({ 
    user: userId, 
    $or: [
      { projects: { $exists: true, $not: { $size: 0 } } },
      { certifications: { $exists: true, $not: { $size: 0 } } }
    ]
  }).countDocuments();
  evidencePoints = Math.min(10, skillsWithEvidence * 2); // 2 points per skill with evidence
  score += evidencePoints;

  const breakdown = {
    profile: { label: 'Complete Profile', points: 15, current: profilePoints, complete: profilePoints >= 15 },
    resume: { label: 'Upload Resume', points: 5, current: resumePoints, complete: resumePoints >= 5 },
    skills: { label: 'Add Skills', points: 20, current: skillsPoints, complete: skillsPoints >= 20 },
    projects: { label: 'Add Projects', points: 25, current: projectsPoints, complete: projectsPoints >= 25 },
    certifications: { label: 'Add Certifications', points: 15, current: certificationsPoints, complete: certificationsPoints >= 15 },
    achievements: { label: 'Add Achievements', points: 10, current: achievementsPoints, complete: achievementsPoints >= 10 },
    evidence: { label: 'Link Evidence to Skills', points: 10, current: evidencePoints, complete: evidencePoints >= 10 }
  };

  return {
    score,
    breakdown
  };
};

module.exports = {
  calculatePortfolioStrength
};
