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
    console.log('Delivery service connected to Redis');
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
 * Get user connection info from Redis
 */
async function getUserConnection(userId) {
  try {
    const key = `user:${userId}:connection`;
    console.log(`Getting connection info for user ${userId} with key: ${key}`);
    
    const connectionInfo = await redisClient.get(key);
    console.log(`Raw connection info for user ${userId}:`, connectionInfo);
    
    if (connectionInfo) {
      const parsed = JSON.parse(connectionInfo);
      console.log(`Parsed connection info for user ${userId}:`, parsed);
      return parsed;
    } else {
      console.log(`No connection info found for user ${userId}`);
      return null;
    }
  } catch (error) {
    console.error('Error getting user connection:', error);
    return null;
  }
}

module.exports = {
  initRedis,
  subscribeToChannel,
  publishEvent,
  getUserConnection,
  getClient: () => redisClient
};