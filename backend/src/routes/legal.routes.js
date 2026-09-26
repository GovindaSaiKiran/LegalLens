const express = require('express');
const router = express.Router();
const legalController = require('../controllers/legal.controller');
const { optionalAuth } = require('../middleware/auth');

router.post('/ask', optionalAuth, legalController.ask);
router.get('/jurisdictions', legalController.getJurisdictions);
router.get('/sources', legalController.getSources);

module.exports = router;
