const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getPortfolioStrength,
  getRecommendations
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAnalytics);
router.get('/portfolio-strength', protect, getPortfolioStrength);
router.get('/recommendations', protect, getRecommendations);

module.exports = router;
