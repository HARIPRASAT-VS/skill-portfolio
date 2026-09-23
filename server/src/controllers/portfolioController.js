const User = require('../models/User');
const Profile = require('../models/Profile');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Certification = require('../models/Certification');
const Achievement = require('../models/Achievement');

// @desc    Get public portfolio data
// @route   GET /api/portfolio/:username
// @access  Public
const getPublicPortfolio = async (req, res) => {
  try {
    const { username } = req.params;

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userId = user._id;

    // Fetch public data for the user
    const profile = await Profile.findOne({ user: userId, isPublic: true });
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Public profile not found' });
    }

    const skills = await Skill.find({ user: userId, isPublic: true });
    
    const projects = await Project.find({ user: userId, isPublic: true })
      .populate('skills', 'name category level');
      
    const certifications = await Certification.find({ user: userId, isPublic: true })
      .populate('skills', 'name category level');
      
    const achievements = await Achievement.find({ user: userId, isPublic: true });

    res.status(200).json({
      success: true,
      data: {
        profile,
        skills,
        projects,
        certifications,
        achievements,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPublicPortfolio,
};
