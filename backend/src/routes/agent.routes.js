const express = require('express');
const router = express.Router();
const agentService = require('../services/agentService');
const { optionalAuth } = require('../middleware/auth');

// POST /api/agent/chat or /api/agent/ask
const handleAgentQuery = async (req, res, next) => {
  try {
    const { 
      message, 
      currentRoute = '/', 
      currentPageTitle = 'LegalLens', 
      pageContext = {}, 
      conversationHistory = [],
      language = 'en'
    } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide a message or question for the agent.' });
    }

    const result = await agentService.processUserQuery({
      message: message.trim(),
      currentRoute,
      currentPageTitle,
      pageContext,
      conversationHistory,
      language
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

router.post('/chat', optionalAuth, handleAgentQuery);
router.post('/ask', optionalAuth, handleAgentQuery);

module.exports = router;
