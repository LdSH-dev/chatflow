const { getUserPresence, getOnlineUsers } = require('../utils/redis');

/**
 * Get user presence status
 */
async function getPresence(req, res) {
  try {
    const { userId } = req.params;
    const presence = await getUserPresence(parseInt(userId));
    
    res.json({
      success: true,
      data: { presence }
    });
  } catch (error) {
    console.error('Get presence error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get presence status'
    });
  }
}

/**
 * Get all online users
 */
async function getOnlineUsersList(req, res) {
  try {
    const onlineUsers = await getOnlineUsers();
    
    res.json({
      success: true,
      data: { onlineUsers }
    });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get online users'
    });
  }
}

module.exports = {
  getPresence,
  getOnlineUsersList
};