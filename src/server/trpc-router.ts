import { nanoid } from "nanoid";
import cookie from "cookie";
import bcrypt from "bcrypt";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import userModel, { IUser } from "./model/user.model";
import connectRedis, { redisClient } from "./database/redis";
import * as crypto from "node:crypto";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import connectMongoose from "./database/mongoose";
import type { MongoServerError } from "mongodb";
import shortModel from "./model/short.model";
import { IShortOutput } from "./type";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  await connectMongoose();
  await connectRedis();

  return opts;
};

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const protectedProcedure = t.procedure.use(async (opts) => {
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

const sessionProcedure = t.procedure.use(async (opts) => {
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

async function generateSlug(): Promise<string> {
  const redis = await redisClient();
  const slug = nanoid(6);
  const exists = await redis.get(`session:slug:${slug}`);
  return exists ? await generateSlug() : slug;
}

export const appRouter = t.router({
  getShortById: protectedProcedure.input(z.string()).query(async (opts) => {
    const { input } = opts;
    const Short = shortModel();
    const user = opts.ctx.user;
    const short = await Short.findOne({ user: user._id, _id: input });
    if (!short) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Short not found",
      });
    }

    return short as unknown as IShortOutput;
  }),
  getHistory: protectedProcedure
    .input(z.object({ cursor: z.number().nullish() }))
    .query(async (opts) => {
      const user_id = opts.ctx.user?._id;
      const Short = shortModel();
      const data = await Short.find({ user: user_id })
        .skip(opts.input.cursor || 0)
        .limit(21)
        .sort("-createdAt");

      const hasMore = data.length > 20;
      const shorts = data.slice(0, 20) as unknown as IShortOutput[];

      return { hasMore, shorts };
    }),
  checkEmailRegistered: publicProcedure
    .input(z.string())
    .mutation(async (opts) => {
      const { input } = opts;
      const User = userModel();

      const user = await User.findOne({ email: input });
      if (user) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered",
        });
      }
      return true;
    }),
  register: publicProcedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(async (opts) => {
      const { input, ctx } = opts;
      const User = userModel();

      const user = new User();
      user.email = input.email;
      user.password = input.password;
      await user.save().catch((err: MongoServerError) => {
        if (err.code === 11000) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An error occured, try again later",
          });
        }
      });

      const session = crypto.randomBytes(16).toString("base64url");

      const redis = await redisClient();
      await redis.set(
        `shorter:session:${user._id}:${session}`,
        JSON.stringify(user)
      );

      const _session = user.id + "|" + session;
      ctx.resHeaders.set(
        "set-cookie",
        `session=${_session}; httpOnly;`
        // `session=${_session}; httpOnly; secure;`
      );

      return true;
    }),
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async (opts) => {
      const { input, ctx } = opts;
      const User = userModel();

      const user = await User.findOne({ email: input.email });
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }

      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Wrong Password",
        });
      }

      const session = crypto.randomBytes(16).toString("base64url");

      const redis = await redisClient();
      await redis.set(
        `shorter:session:${user._id}:${session}`,
        JSON.stringify(user)
      );

      const _session = user.id + "|" + session;
      ctx.resHeaders.set(
        "set-cookie",
        `session=${_session}; httpOnly;`
        // `session=${_session}; httpOnly; secure;`
      );

      return true;
    }),
  getMe: protectedProcedure.query(async (opts) => {
    const user = opts.ctx.user;
    return user.email;
  }),
  createShort: sessionProcedure
    .input(
      z.object({
        link: z.string().url(),
        alias: z.optional(z.string()),
      })
    )
    .mutation(async (opts) => {
      const user_id = opts.ctx.user?._id;
      const { link, alias } = opts.input;

      const redis = await redisClient();

      let slug;

      if (alias) {
        const exists = await redis.get(`shorter:slug:${alias}`);
        if (exists) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Alias not available",
            cause: "alias",
          });
        }
      } else {
        slug = await generateSlug();
      }

      const Short = shortModel();

      const short = new Short();
      short.real_url = link;
      short.alias = alias;
      short.slug = alias || (slug as string);
      short.user = user_id;

      await short.save();

      await redis.set(`shorter:slug:${alias || slug}`, JSON.stringify(short));

      return short as unknown as IShortOutput;
    }),
  deleteShort: protectedProcedure.input(z.string()).mutation(async (opts) => {
    const { input } = opts;
    const Short = shortModel();
    const user = opts.ctx.user;
    const short = await Short.findOneAndDelete({
      user: user._id,
      _id: input,
    });
    if (!short) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Short not found" });
    }

    const redis = await redisClient();
    redis.del(`shorter:slug:${short.slug}`);

    return true;
  }),
  availableSlug: publicProcedure.input(z.string()).mutation(async (opts) => {
    const redis = await redisClient();
    const exists = await redis.exists(`shorter:slug:${opts.input}`);
    if (exists) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Alias is not available",
      });
    }
    return true;
  }),
  updateShort: protectedProcedure
    .input(
      z.object({
        _id: z.string(),
        link: z.string().url(),
        alias: z.optional(z.string()),
      })
    )
    .mutation(async (opts) => {
      const Short = shortModel();
      const { _id, link, alias } = opts.input;
      const user = opts.ctx.user;

      let slug;

      const redis = await redisClient();
      if (alias) {
        const exists = await redis.get(`shorter:slug:${alias}`);
        if (exists) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Alias not available",
            cause: "alias",
          });
        }
      } else {
        slug = await generateSlug();
      }

      const short = await Short.findOne({ _id, user: user._id });
      if (!short) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Short not found",
        });
      }

      const old_short = short.toJSON();
      short.slug = alias || (slug as string);
      short.alias = alias;
      short.real_url = link;

      await short.save();

      await redis.del(`shorter:slug:${old_short.alias || old_short.slug}`);

      return short as unknown as IShortOutput;
    }),
  logout: protectedProcedure.mutation(async (opts) => {
    const user = opts.ctx.user;
    const session = opts.ctx.session;

    const redis = await redisClient();
    await redis.del(`shorter:session:${user._id}:${session}`);

    opts.ctx.resHeaders.set(
      "set-cookie",
      `session=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`
    );

    return true;
  }),
});

export type AppRouter = typeof appRouter;
