import * as redis from "redis";

let client: redis.RedisClientType<
  redis.RedisDefaultModules,
  redis.RedisFunctions,
  redis.RedisScripts
>;

export const redisClient = () => (client ? client : connectRedis());

async function connectRedis() {
  const uri = process.env.REDIS_URI;
  if (!uri) {
    throw new Error("REDIS_URI Not found at .env file");
  }

  if (!client?.isOpen) {
    if (client) {
      console.log("client.isReady", client.isReady);
    }

    client = await redis
      .createClient({
        url: uri,
      })
      .on("error", (err) => console.log("Redis Client Error", err))
      .connect();

    console.log("connected to redis");
  }

  return client;
}

export default connectRedis;
