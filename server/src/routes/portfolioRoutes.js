const express = require('express');
const router = express.Router();
const { getPublicPortfolio, getDemoUsername } = require('../controllers/portfolioController');

router.get('/demo/username', getDemoUsername);
router.get('/:username', getPublicPortfolio);

module.exports = router;
