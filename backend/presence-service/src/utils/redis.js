const { createClient } = require('redis');

let redisClient;

/**
 * Initialize Redis client
 */
async function initRedis() {
  redisClient = createClient({
    url: process.env.REDIS_URL
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Presence service connected to Redis');
  });

  await redisClient.connect();
}

/**
 * Subscribe to Redis channel
 */
async function subscribeToChannel(channel, callback) {
  const subscriber = redisClient.duplicate();
  await subscriber.connect();
  
  await subscriber.subscribe(channel, (message) => {
    try {
      const data = JSON.parse(message);
      callback(data);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
}

/**
 * Publish event to Redis
 */
async function publishEvent(channel, data) {
  try {
    await redisClient.publish(channel, JSON.stringify(data));
  } catch (error) {
    console.error('Error publishing event:', error);
  }
}

/**
 * Set user online status
 */
async function setUserOnline(userId, socketId) {
  try {
    const connectionInfo = {
      connected: true,
      socketId,
      connectedAt: new Date(),
      lastSeen: new Date()
    };
    
    await redisClient.setEx(`user:${userId}:connection`, 3600, JSON.stringify(connectionInfo));
    await redisClient.sAdd('online_users', userId.toString());
    
    return connectionInfo;
  } catch (error) {
    console.error('Error setting user online:', error);
    throw error;
  }
}

/**
 * Set user offline status
 */
async function setUserOffline(userId) {
  try {
    await redisClient.del(`user:${userId}:connection`);
    await redisClient.sRem('online_users', userId.toString());
    
    await redisClient.setEx(`user:${userId}:last_seen`, 86400, new Date().toISOString());
  } catch (error) {
    console.error('Error setting user offline:', error);
    throw error;
  }
}

/**
 * Get user presence status
 */
async function getUserPresence(userId) {
  try {
    const connectionInfo = await redisClient.get(`user:${userId}:connection`);
    
    if (connectionInfo) {
      return {
        online: true,
        ...JSON.parse(connectionInfo)
      };
    }
    
    const lastSeen = await redisClient.get(`user:${userId}:last_seen`);
    return {
      online: false,
      lastSeen: lastSeen || null
    };
  } catch (error) {
    console.error('Error getting user presence:', error);
    return { online: false, lastSeen: null };
  }
}

/**
 * Get all online users
 */
async function getOnlineUsers() {
  try {
    const userIds = await redisClient.sMembers('online_users');
    return userIds.map(id => parseInt(id));
  } catch (error) {
    console.error('Error getting online users:', error);
    return [];
  }
}

module.exports = {
  initRedis,
  subscribeToChannel,
  publishEvent,
  setUserOnline,
  setUserOffline,
  getUserPresence,
  getOnlineUsers,
  getClient: () => redisClient
};