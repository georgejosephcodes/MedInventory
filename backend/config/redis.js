const Redis = require("ioredis");

let isRedisReady = false;

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      tls: {},                // REQUIRED
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
    })
  : new Redis({
      host: "127.0.0.1",
      port: 6379,
    });

redis.on("ready", () => {
  isRedisReady = true;
  console.log("✅ Redis ready");
});

redis.on("error", (err) => {
  isRedisReady = false;
  console.error("❌ Redis error:", err.message);
});

redis.isReady = () => isRedisReady;

module.exports = redis;
