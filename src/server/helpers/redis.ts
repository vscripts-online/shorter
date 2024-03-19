import crypto from "node:crypto";
import { RedisClient } from "../database/redis";
import { IUser } from "../model/user.model";
import { IShort } from "../model/short.model";

export class Redis {
  client: RedisClient;

  constructor(client: RedisClient) {
    this.client = client;
  }

  slugExists(slug: string) {
    return this.client.exists(`shorter:slug:${slug}`);
  }

  getSession(_id: string, session: string) {
    return this.client.get(`shorter:session:${_id}:${session}`);
  }

  async setSession(user: IUser) {
    const random = crypto.randomBytes(16).toString("base64url");
    const session = `${user._id}:${random}`;
    await this.client.set(`shorter:session:${session}`, JSON.stringify(user));
    return random;
  }

  async setSlug(slug: string, short: IShort) {
    await this.client.set(`shorter:slug:${slug}`, JSON.stringify(short));
  }

  async deleteSlug(slug: string) {
    return this.client.del(`shorter:slug:${slug}`);
  }

  async deleteSession(_id: string, session: string) {
    return this.client.del(`shorter:session:${_id}:${session}`);
  }
}
