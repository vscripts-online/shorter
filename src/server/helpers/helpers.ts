import { TRPCError } from "@trpc/server";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/unstable-core-do-not-import";
import cookie from "cookie";
import { nanoid } from "nanoid";
import shortModel from "../model/short.model";
import { AuthAPI } from "@/auth";

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
  const { session } = cookie.parse(cookies);

  try {
    const { status, user } = await AuthAPI.me()

    if (!status)
      throw ''

    return { session, user }
  } catch (error) {
    console.log(error)
    throw new Error("User not found");
  }
}

// export async function syncUnloggedShorts(user: number, tracking: string) {
//   await Short.updateMany({ user: { $exists: false }, tracking }, { user });
// }
