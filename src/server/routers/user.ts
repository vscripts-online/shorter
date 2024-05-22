import { z } from "zod";
import { TRPCException, generateSlug } from "../helpers/helpers";
import shortModel from "../model/short.model";
import changeModel from "../model/change.model";
import { protectedProcedure as procedure, router } from "../trpc";
import { IShortOutput } from "../type";

const Short = shortModel();
const Change = changeModel();

export const userRouter = router({
  getShortById: procedure.input(z.string()).query(async (opts) => {
    const { input } = opts;
    const user = opts.ctx.user;
    const short = await Short.findOne({ user: user.id, _id: input });
    if (!short) {
      throw new TRPCException("NOT_FOUND", "Short not found");
    }

    return short as unknown as IShortOutput;
  }),
  deleteShort: procedure.input(z.string()).mutation(async (opts) => {
    const { input } = opts;
    const user = opts.ctx.user;
    const short = await Short.findOneAndDelete({
      user: user.id,
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

      const short = await Short.findOne({ _id, user: user.id });
      if (!short) {
        throw new TRPCException("NOT_FOUND", "Short not found");
      }

      if (alias !== short.slug) {
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
      const slug = alias || await generateSlug()

      short.slug = slug
      short.real_url = link;
      short.tracking = opts.ctx.cookies.tracking;

      await short.save();

      const change = new Change({
        data: {
          clicked: old_short.clicked,
          real_url: old_short.real_url,
          slug: old_short.slug,
          tracking: old_short.tracking,
        },
        short: old_short._id,
      });
      change.save();

      await global.redisClient.deleteSlug(old_short.slug);
      await global.redisClient.setSlug(short.slug, short);

      return short as unknown as IShortOutput;
    }),
});
