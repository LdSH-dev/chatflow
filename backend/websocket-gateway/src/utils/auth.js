const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

/**
 * Authenticate user token via auth service
 */
async function authenticateUser(token) {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data.data.user;
  } catch (error) {
    console.error('Authentication error:', error.message);
    return null;
  }
}

module.exports = {
  authenticateUser
};