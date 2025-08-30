const express = require('express');
const multer = require('multer');
const { sendMessage, uploadMedia, getConversation, markAsDelivered, markAsRead } = require('../controllers/messageController');
const { authenticateToken } = require('../utils/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  }
});

router.post('/send', authenticateToken, sendMessage);
router.post('/upload-media', authenticateToken, upload.single('file'), uploadMedia);
router.get('/conversation/:userId', authenticateToken, getConversation);
router.put('/:messageId/delivered', authenticateToken, markAsDelivered);
router.put('/:messageId/read', authenticateToken, markAsRead);

module.exports = router;