import { TRPCError, initTRPC } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import cookie from "cookie";
import superjson from "superjson";
import connectMongoose from "../database/mongoose";
import connectRedis, { redisClient } from "../database/redis";
import { IUser } from "../model/user.model";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  await connectMongoose();
  const redis = await connectRedis();

  return { ...opts, redis };
};

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
});

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async (opts) => {
  try {
    const cookies = opts.ctx.req.headers.get("cookie");
    const { session } = cookie.parse(cookies!);
    const [_id, _session] = session.split("|");
    const redis = await redisClient();
    const user = await redis.get(`shorter:session:${_id}:${_session}`);
    if (!user) {
      throw "err";
    }
    return opts.next({
      ctx: {
        user: JSON.parse(user) as IUser,
        session: _session,
      },
    });
  } catch (error) {
    opts.ctx.resHeaders.set(
      "set-cookie",
      `session=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`
    );

    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }
});

export const sessionProcedure = t.procedure.use(async (opts) => {
  try {
    const cookies = opts.ctx.req.headers.get("cookie");
    const { session } = cookie.parse(cookies!);
    const [_id, _session] = session.split("|");
    const redis = await redisClient();
    const user = await redis.get(`shorter:session:${_id}:${_session}`);
    if (!user) {
      throw "err";
    }
    return opts.next({
      ctx: {
        user: JSON.parse(user) as IUser,
      },
    });
  } catch (error) {
    return opts.next({});
  }
});
