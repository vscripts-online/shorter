import crypto from "node:crypto";
import * as redis from "redis";
import { IShort } from "../model/short.model";

export type RedisClient = redis.RedisClientType<
  redis.RedisDefaultModules,
  redis.RedisFunctions,
  redis.RedisScripts
>;

const namespace = "shorter";
const slug_namespace = `${namespace}:slug`;
const session_namespace = `${namespace}:session`;

export class Redis {
  client: RedisClient;

  constructor(client: RedisClient) {
    this.client = client;
  }

  slugExists(slug: string) {
    return this.client.exists(`${slug_namespace}:${slug}`);
  }

  getSlug(slug: string) {
    return this.client.get(`${slug_namespace}:${slug}`);
  }

  setSlug(slug: string, short: IShort) {
    return this.client.set(`${slug_namespace}:${slug}`, JSON.stringify(short));
  }

  deleteSlug(slug: string) {
    return this.client.del(`${slug_namespace}:${slug}`);
  }
}
