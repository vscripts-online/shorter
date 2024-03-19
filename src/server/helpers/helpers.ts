import { TRPCError } from "@trpc/server";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/unstable-core-do-not-import";
import cookie from "cookie";
import { nanoid } from "nanoid";
import { IUser } from "../model/user.model";
import { IUserOutput } from "../type";
import { Redis } from "./redis";

export class TRPCException extends TRPCError {
  constructor(code: TRPC_ERROR_CODE_KEY, message?: string, cause?: unknown) {
    super({ code, message, cause });
  }
}

export async function generateSlug(redis: Redis): Promise<string> {
  const slug = nanoid(6);
  const exists = await redis.slugExists(slug);
  return exists ? await generateSlug(redis) : slug;
}

export async function getUserBySession(redis: Redis, cookies: string) {
  const { session: _session } = cookie.parse(cookies);
  const [_id, session] = _session.split("|");
  const user = await redis.getSession(_id, session);
  if (!user) {
    throw new Error("User not found");
  }
  return { _id, session, user: JSON.parse(String(user)) as IUserOutput };
}

export function getCookieString(
  session: string,
  expire = false
): [string, string] {
  const expires = expire ? "expires=Thu, 01 Jan 1970 00:00:00 GMT;" : "";
  return ["set-cookie", `session=${session}; httpOnly; ${expires}`];
}

export function setSessionCookie(
  resHeaders: Headers,
  session: string,
  expire = false
) {
  const expires = expire ? "expires=Thu, 01 Jan 1970 00:00:00 GMT;" : "";
  const cookie = `session=${session}; httpOnly; ${expires}`;
  resHeaders.set("set-cookie", cookie);
}

export async function newSession(redis: Redis, user: IUser) {
  const random = await redis.setSession(user);
  const session = user._id + "|" + random;
  return session;
}
