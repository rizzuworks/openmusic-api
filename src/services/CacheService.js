const redis = require('redis');

class CacheService {
  constructor() {
    this.client = null;
    this.isReady = false;
  }

  async connect() {
    if (this.client && this.isReady) {
      return this.client;
    }

    try {
      this.client = redis.createClient({
        socket: {
          host: process.env.REDIS_SERVER || 'localhost',
          port: 6379,
        },
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isReady = false;
      });

      this.client.on('ready', () => {
        console.log('Redis Client Ready');
        this.isReady = true;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.isReady = false;
      return null;
    }
  }

  async get(key) {
    if (!this.isReady) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key, value, expirationInSeconds = 1800) {
    if (!this.isReady) return false;
    try {
      await this.client.setEx(key, expirationInSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async delete(key) {
    if (!this.isReady) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DELETE error:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.client && this.isReady) {
      await this.client.quit();
      this.isReady = false;
    }
  }
}

module.exports = new CacheService();
