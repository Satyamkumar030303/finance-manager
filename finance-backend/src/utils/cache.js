const { createClient } = require("redis");
const logger = require("../config/logger");

let client = null;
let connected = false;

const connect = async () => {
  if (!process.env.REDIS_URL) return;
  try {
    client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (err) => logger.warn("Redis error:", err.message));
    await client.connect();
    connected = true;
    logger.info("Redis connected");
  } catch (err) {
    logger.warn("Redis unavailable — caching disabled:", err.message);
    connected = false;
    client = null;
  }
};

const get = async (key) => {
  if (!connected || !client) return null;
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
};

const set = async (key, value, ttlSeconds = 300) => {
  if (!connected || !client) return;
  try {
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // silently ignore
  }
};

const del = async (pattern) => {
  if (!connected || !client) return;
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) await client.del(keys);
  } catch {
    // silently ignore
  }
};

module.exports = { connect, get, set, del };
