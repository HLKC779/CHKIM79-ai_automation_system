import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

let redisClient = null;

export const initRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis connection failed after 10 retries');
            return false;
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    await redisClient.connect();
    
    // Test the connection
    await redisClient.ping();
    logger.info('Redis connection test successful');
    
    return redisClient;
  } catch (error) {
    logger.error('Redis initialization error:', error);
    // Don't throw error for Redis - it's optional for caching
    return null;
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    logger.warn('Redis client not initialized');
    return null;
  }
  return redisClient;
};

export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};

// Cache utilities
export const cacheGet = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) return null;
    
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Redis get error:', error);
    return null;
  }
};

export const cacheSet = async (key, value, ttl = 3600) => {
  try {
    const client = getRedisClient();
    if (!client) return false;
    
    await client.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error('Redis set error:', error);
    return false;
  }
};

export const cacheDelete = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) return false;
    
    await client.del(key);
    return true;
  } catch (error) {
    logger.error('Redis delete error:', error);
    return false;
  }
};

export const cacheClear = async (pattern = '*') => {
  try {
    const client = getRedisClient();
    if (!client) return false;
    
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
    return true;
  } catch (error) {
    logger.error('Redis clear error:', error);
    return false;
  }
};