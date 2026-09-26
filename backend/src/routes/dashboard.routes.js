const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { optionalAuth } = require('../middleware/auth');

router.get('/overview', optionalAuth, dashboardController.getOverview);
router.post('/save/:id', optionalAuth, dashboardController.toggleSave);
router.get('/demo-documents', dashboardController.getDemoDocuments);

module.exports = router;
