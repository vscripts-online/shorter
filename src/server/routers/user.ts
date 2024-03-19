import { TRPCError } from "@trpc/server";
import { z } from "zod";
import shortModel from "../model/short.model";
import { IShortOutput } from "../type";
import { protectedProcedure as procedure, router } from "./_app";
import { RedisClient } from "../database/redis";
import { nanoid } from "nanoid";
import { generateSlug } from "../helpers";

const Short = shortModel();

export const userRouter = router({
  getMe: procedure.query(async (opts) => {
    const user = opts.ctx.user;
    return user.email;
  }),
  getShortById: procedure.input(z.string()).query(async (opts) => {
    const { input } = opts;
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
  getHistory: procedure
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
  deleteShort: procedure.input(z.string()).mutation(async (opts) => {
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

    const { redis } = await opts.ctx;
    redis.del(`shorter:slug:${short.slug}`);

    return true;
  }),
  updateShort: procedure
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

      const { redis } = await opts.ctx;
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
        slug = await generateSlug(redis);
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
  logout: procedure.mutation(async (opts) => {
    const user = opts.ctx.user;
    const session = opts.ctx.session;

    const { redis } = await opts.ctx;
    await redis.del(`shorter:session:${user._id}:${session}`);

    opts.ctx.resHeaders.set(
      "set-cookie",
      `session=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`
    );

    return true;
  }),
});
