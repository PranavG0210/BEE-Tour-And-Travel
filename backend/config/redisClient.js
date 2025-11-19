const { createClient } = require('redis');
//connection 
let redisClient = null;
// Initialize and connect Redis client
// Exported function to connect Redis
const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    redisClient = createClient({
      url: redisUrl,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Client Connected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('❌ Redis Connection Error:', error.message);
    return null;
  }
};

const setCache = async (key, data, ttl = 3600) => {
  try {
    if (!redisClient || !redisClient.isOpen) {
      return false;
    }

    const stringData = JSON.stringify(data);
    await redisClient.setEx(key, ttl, stringData);
    return true;
  } catch (error) {
    console.error(`Redis setCache error for key ${key}:`, error.message);
    return false;
  }
};

const getCache = async (key) => {
  try {
    if (!redisClient || !redisClient.isOpen) {
      return null;
    }

    const cachedData = await redisClient.get(key);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  } catch (error) {
    console.error(`Redis getCache error for key ${key}:`, error.message);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    if (!redisClient || !redisClient.isOpen) {
      return false;
    }

    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error(`Redis deleteCache error for key ${key}:`, error.message);
    return false;
  }
};

const deleteCachePattern = async (pattern) => {
  try {
    if (!redisClient || !redisClient.isOpen) {
      return false;
    }

    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error(`Redis deleteCachePattern error for pattern ${pattern}:`, error.message);
    return false;
  }
};

const clearAllCache = async () => {
  try {
    if (!redisClient || !redisClient.isOpen) {
      return false;
    }

    await redisClient.flushAll();
    return true;
  } catch (error) {
    console.error('Redis clearAllCache error:', error.message);
    return false;
  }
};

module.exports = {
  connectRedis,
  setCache,
  getCache,
  deleteCache,
  deleteCachePattern,
  clearAllCache,
  getClient: () => redisClient,
};

