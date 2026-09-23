const express = require('express');
const router = express.Router();
const {
  getAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} = require('../controllers/achievementController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAchievements)
  .post(protect, createAchievement);

router.route('/:id')
  .get(protect, getAchievement)
  .put(protect, updateAchievement)
  .delete(protect, deleteAchievement);

module.exports = router;
