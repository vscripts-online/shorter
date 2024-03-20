import { z } from "zod";
import { TRPCException, setSessionCookie } from "../helpers/helpers";
import shortModel from "../model/short.model";
import changeModel from "../model/change.model";
import { protectedProcedure as procedure, router } from "../trpc";
import { IShortOutput } from "../type";

const Short = shortModel();
const Change = changeModel();

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
      throw new TRPCException("NOT_FOUND", "Short not found");
    }

    return short as unknown as IShortOutput;
  }),
  getHistory: procedure
    .input(z.object({ cursor: z.number().nullish() }))
    .query(async (opts) => {
      const user_id = opts.ctx.user?._id;
      const data = await Short.find({ user: user_id })
        .skip(opts.input.cursor || 0)
        .limit(21)
        .sort("-updatedAt");

      const hasMore = data.length > 20;
      const shorts = data.slice(0, 20) as unknown as IShortOutput[];

      return { hasMore, shorts };
    }),
  deleteShort: procedure.input(z.string()).mutation(async (opts) => {
    const { input } = opts;
    const user = opts.ctx.user;
    const short = await Short.findOneAndDelete({
      user: user._id,
      _id: input,
    });
    if (!short) {
      throw new TRPCException("NOT_FOUND", "Short not found");
    }

    await global.redisClient.deleteSlug(short.slug);

    return true;
  }),
  updateShort: procedure
    .input(
      z.object({
        _id: z.string(),
        link: z.string().url(),
        alias: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { _id, link, alias } = opts.input;
      const user = opts.ctx.user;

      const short = await Short.findOne({ _id, user: user._id });
      if (!short) {
        throw new TRPCException("NOT_FOUND", "Short not found");
      }

      if (alias !== short.alias) {
        const exists = await global.redisClient.slugExists(alias);
        if (exists) {
          throw new TRPCException(
            "BAD_REQUEST",
            "Alias not available",
            "alias"
          );
        }
      }

      const old_short = short.toJSON();
      short.slug = alias || old_short.slug;
      short.alias = alias;
      short.real_url = link;
      short.__v;

      await short.save();

      const change = new Change({
        data: {
          alias: old_short.alias,
          clicked: old_short.clicked,
          real_url: old_short.real_url,
          slug: old_short.slug,
        },
        short: old_short._id,
      });
      change.save();

      await global.redisClient.deleteSlug(old_short.alias || old_short.slug);
      await global.redisClient.setSlug(short.slug, short);

      return short as unknown as IShortOutput;
    }),
  logout: procedure.mutation(async (opts) => {
    const user = opts.ctx.user;
    const session = opts.ctx.session;

    await global.redisClient.deleteSession(user._id, session);

    setSessionCookie(opts.ctx.resHeaders, "");

    return true;
  }),
});
