const Achievement = require('../models/Achievement');

// @desc    Get all achievements for current user
// @route   GET /api/achievements
// @access  Private
const getAchievements = async (req, res) => {
  try {
    const { category } = req.query;
    let query = { user: req.user.id };
    
    if (category) {
      query.category = category;
    }

    const achievements = await Achievement.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single achievement
// @route   GET /api/achievements/:id
// @access  Private
const getAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findOne({ _id: req.params.id, user: req.user.id });

    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    res.status(200).json({ success: true, data: achievement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create an achievement
// @route   POST /api/achievements
// @access  Private
const createAchievement = async (req, res) => {
  try {
    const achievementData = { ...req.body, user: req.user.id };
    const achievement = await Achievement.create(achievementData);
    res.status(201).json({ success: true, data: achievement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an achievement
// @route   PUT /api/achievements/:id
// @access  Private
const updateAchievement = async (req, res) => {
  try {
    let achievement = await Achievement.findOne({ _id: req.params.id, user: req.user.id });

    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    achievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: achievement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an achievement
// @route   DELETE /api/achievements/:id
// @access  Private
const deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findOne({ _id: req.params.id, user: req.user.id });

    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    await achievement.deleteOne();
    res.status(200).json({ success: true, message: 'Achievement removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
};
