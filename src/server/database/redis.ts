import * as redis from "redis";
import { Redis } from "../helpers/redis";

declare global {
  var redisClient: Redis;
}

async function connectRedis() {
  const uri = process.env.REDIS_URI;
  if (!uri) {
    throw new Error("REDIS_URI Not found at .env file");
  }

  if (global.redisClient?.client.isReady) {
    return global.redisClient;
  }
  console.log("Redis connecting to", uri);
  const client = await redis
    .createClient({ url: uri })
    .on("error", (err) => console.log("Redis connection error", err))
    .connect();

  console.log("connected to redis");

  global.redisClient = new Redis(client);

  return global.redisClient;
}

export default connectRedis;
