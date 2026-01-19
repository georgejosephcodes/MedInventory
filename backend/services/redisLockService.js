const RedlockImport = require("redlock");
const redis = require("../config/redis");

const Redlock = RedlockImport.default || RedlockImport;

const redlock = new Redlock(
  [redis],
  {
    driftFactor: 0.01,
    retryCount: 3,
    retryDelay: 200,
    retryJitter: 200,
  }
);

class RedisLockService {
  async withLock(resource, ttl, fn) {
    const lock = await redlock.acquire([resource], ttl);
    try {
      return await fn();
    } finally {
      await lock.release();
    }
  }
}

module.exports = new RedisLockService();
