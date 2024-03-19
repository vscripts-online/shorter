import { initTRPC } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import connectMongoose from "./database/mongoose";
import connectRedis from "./database/redis";
import {
  TRPCException,
  getUserBySession,
  setSessionCookie,
} from "./helpers/helpers";
import { Redis } from "./helpers/redis";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  await connectMongoose();
  const redis = await connectRedis();

  return { ...opts, redis: new Redis(redis) };
};

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
});

export const router = t.router;

export const publicProcedure = t.procedure;

const parseSession = t.middleware(async (opts) => {
  try {
    const cookies = opts.ctx.req.headers.get("cookie");
    const { session, user } = await getUserBySession(opts.ctx.redis, cookies!);
    return opts.next({ ctx: { user, session } });
  } catch (error) {
    return opts.next({});
  }
});

export const sessionProcedure = t.procedure.use(parseSession);

export const protectedProcedure = t.procedure
  .use(parseSession)
  .use(async (opts) => {
    if (opts.ctx.user) {
      return opts.next();
    }

    setSessionCookie(opts.ctx.resHeaders, "");
    throw new TRPCException("UNAUTHORIZED");
  });
