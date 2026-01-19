const redis = require("../config/redis");

class CacheService {
  async get(key) {
    try {
      if (!redis.isReady()) return null;

      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      // fail-open
      return null;
    }
  }

  async set(key, value, ttl = 300) {
    try {
      if (!redis.isReady()) return;

      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (err) {
      // ignore redis failure
    }
  }

  async del(key) {
    try {
      if (!redis.isReady()) return;

      await redis.del(key);
    } catch (err) {}
  }

  async delPattern(pattern) {
    try {
      if (!redis.isReady()) return;

      const keys = await redis.keys(pattern);
      if (keys.length) {
        await redis.del(keys);
      }
    } catch (err) {}
  }
}

module.exports = new CacheService();
