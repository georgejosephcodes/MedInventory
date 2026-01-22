const redis = require("../config/redis");

class CacheService {
  async get(key) {
    try {
      if (!redis.isReady()) return null;

      const data = await redis.get(key);
      if (!data) return null;

      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    } catch {
      return null;
    }
  }

  async set(key, value, ttl = 300) {
    try {
      if (!redis.isReady()) return;

      await redis.set(
        key,
        JSON.stringify(value),
        "EX",
        ttl
      );
    } catch {}
  }

  async del(key) {
    try {
      if (!redis.isReady()) return;
      await redis.del(key);
    } catch {}
  }

  async delPattern(pattern) {
    try {
      if (!redis.isReady()) return;

      let cursor = "0";
      do {
        const [nextCursor, keys] = await redis.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100
        );
        cursor = nextCursor;

        if (keys.length) {
          await redis.del(keys);
        }
      } while (cursor !== "0");
    } catch {}
  }
}

module.exports = new CacheService();
