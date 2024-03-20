import { TRPCError } from "@trpc/server";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/unstable-core-do-not-import";
import cookie from "cookie";
import { nanoid } from "nanoid";
import { IUser } from "../model/user.model";
import { IUserOutput } from "../type";
import shortModel from "../model/short.model";

const Short = shortModel();

export class TRPCException extends TRPCError {
  constructor(code: TRPC_ERROR_CODE_KEY, message?: string, cause?: unknown) {
    super({ code, message, cause });
  }
}

export async function generateSlug(): Promise<string> {
  const slug = nanoid(6);
  const exists = await global.redisClient.slugExists(slug);
  return exists ? await generateSlug() : slug;
}

export async function getUserBySession(cookies: string) {
  const { session: _session } = cookie.parse(cookies);
  const [_id, session] = _session.split("|");
  const user = await global.redisClient.getSession(_id, session);
  if (!user) {
    throw new Error("User not found");
  }
  return { _id, session, user: JSON.parse(String(user)) as IUserOutput };
}

export function setSessionCookie(resHeaders: Headers, session: string) {
  const expires = !session ? "expires=Thu, 01 Jan 1970 00:00:00 GMT;" : "";
  const cookie = `session=${session}; httpOnly; ${expires}`;
  resHeaders.set("set-cookie", cookie);
}

export async function newSession(user: IUser) {
  const random = await global.redisClient.setSession(user);
  const session = user._id + "|" + random;
  return session;
}

export async function syncUnloggedShorts(user: string, tracking: string) {
  await Short.updateMany({ user: { $exists: false }, tracking }, { user });
}
