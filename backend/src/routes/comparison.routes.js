const express = require('express');
const router = express.Router();
const multer = require('multer');
const comparisonController = require('../controllers/comparison.controller');
const { optionalAuth } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }
});

router.post(
  '/compare',
  optionalAuth,
  upload.fields([
    { name: 'documentA', maxCount: 1 },
    { name: 'documentB', maxCount: 1 }
  ]),
  comparisonController.compareDocuments
);

router.post('/demo', optionalAuth, comparisonController.compareDemo);

module.exports = router;
