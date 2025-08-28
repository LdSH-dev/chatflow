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
    console.log('Connected to Redis');
  });

  await redisClient.connect();
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

module.exports = {
  initRedis,
  publishEvent,
  subscribeToChannel,
  getClient: () => redisClient
};