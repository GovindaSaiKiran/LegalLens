const express = require('express');
const router = express.Router();
const termsController = require('../controllers/terms.controller');
const { optionalAuth } = require('../middleware/auth');

router.post('/analyze-url', optionalAuth, termsController.analyzeUrl);
router.post('/analyze-text', optionalAuth, termsController.analyzeText);
router.post('/demo/:id', optionalAuth, termsController.analyzeDemo);
router.get('/demo/:id', optionalAuth, termsController.analyzeDemo);

module.exports = router;
