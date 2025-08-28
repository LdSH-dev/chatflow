const express = require('express');
const { getPresence, getOnlineUsersList } = require('../controllers/presenceController');

const router = express.Router();

router.get('/user/:userId', getPresence);
router.get('/online', getOnlineUsersList);

module.exports = router;