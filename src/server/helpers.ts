import { nanoid } from "nanoid";
import { RedisClient } from "./database/redis";

export async function generateSlug(redis: RedisClient): Promise<string> {
  const slug = nanoid(6);
  const exists = await redis.get(`session:slug:${slug}`);
  return exists ? await generateSlug(redis) : slug;
}
