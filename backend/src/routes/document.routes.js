const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentController = require('../controllers/document.controller');
const { optionalAuth } = require('../middleware/auth');

// Multer memory storage configuration (up to 15MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.txt', '.doc'];
    const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.includes('pdf') || file.mimetype.includes('word') || file.mimetype.includes('text')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Supported formats are PDF, DOCX, and TXT.'));
    }
  }
});

router.post('/upload', optionalAuth, upload.single('document'), documentController.uploadDocument);
router.post('/chat/:id', optionalAuth, documentController.chatWithDocument);
router.get('/:id', documentController.getDocumentById);
router.get('/:id/chat-history', documentController.getChatHistory);
router.delete('/:id', optionalAuth, documentController.deleteDocument);

module.exports = router;
