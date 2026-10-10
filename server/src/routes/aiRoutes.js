const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/aiController');

// @route   POST /api/ai/chat
// @desc    Chat with AI assistant
// @access  Public (for now)
router.post('/chat', chatWithAI);

module.exports = router;
