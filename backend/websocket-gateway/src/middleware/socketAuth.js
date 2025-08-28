const { authenticateUser } = require('../utils/auth');

/**
 * Socket.IO authentication middleware
 */
async function socketAuthMiddleware(socket, next) {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }
    
    const user = await authenticateUser(token);
    
    if (!user) {
      return next(new Error('Invalid authentication token'));
    }
    
    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
}

module.exports = {
  socketAuthMiddleware
};