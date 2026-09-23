const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Certification = require('../models/Certification');
const Achievement = require('../models/Achievement');
const { calculatePortfolioStrength } = require('../services/portfolioStrengthService');
const { generateRecommendations } = require('../services/recommendationService');

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      portfolioStrengthData,
      recommendations,
      totalSkills,
      totalProjects,
      totalCertifications,
      totalAchievements,
      skillsData,
      projectsData
    ] = await Promise.all([
      calculatePortfolioStrength(userId),
      generateRecommendations(userId),
      Skill.countDocuments({ user: userId }),
      Project.countDocuments({ user: userId }),
      Certification.countDocuments({ user: userId }),
      Achievement.countDocuments({ user: userId }),
      Skill.aggregate([
        { $match: { user: req.user._id } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Project.aggregate([
        { $match: { user: req.user._id } },
        { $unwind: "$technologies" },
        { $group: { _id: "$technologies", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    // Format aggregation results
    const skillsByCategory = skillsData.map(item => ({
      name: item._id,
      value: item.count
    }));

    const projectsByTechnology = projectsData.map(item => ({
      name: item._id,
      value: item.count
    }));

    // For recent activity, we could query a separate Activity model, 
    // or just fetch the most recently created/updated items across collections.
    // For simplicity, we'll fetch recent projects and skills.
    const recentProjects = await Project.find({ user: userId }).sort({ createdAt: -1 }).limit(3);
    const recentActivity = recentProjects.map(p => ({
      id: p._id,
      action: 'Added new project',
      target: p.title,
      date: p.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        portfolioStrength: portfolioStrengthData.score,
        portfolioStrengthBreakdown: portfolioStrengthData.breakdown,
        totalSkills,
        totalProjects,
        totalCertifications,
        totalAchievements,
        skillsByCategory,
        projectsByTechnology,
        recentActivity,
        recommendations
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get portfolio strength only
// @route   GET /api/analytics/portfolio-strength
// @access  Private
const getPortfolioStrength = async (req, res) => {
  try {
    const data = await calculatePortfolioStrength(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recommendations only
// @route   GET /api/analytics/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    const data = await generateRecommendations(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAnalytics,
  getPortfolioStrength,
  getRecommendations
};
