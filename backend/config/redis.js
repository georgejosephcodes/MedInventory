const Redis = require("ioredis");

let isRedisReady = false;

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: 1,
  enableReadyCheck: true,
});

redis.on("ready", () => {
  isRedisReady = true;
  console.log("Redis ready");
});

redis.on("error", (err) => {
  isRedisReady = false;
  console.error("Redis error:", err.message);
});

redis.on("end", () => {
  isRedisReady = false;
  console.warn("Redis connection closed");
});

redis.isReady = () => isRedisReady;

module.exports = redis;
