import { z } from "zod";
import { TRPCException, generateSlug } from "../helpers/helpers";
import shortModel, { IShort } from "../model/short.model";
import { sessionProcedure as procedure, router } from "../trpc";
import { IShortOutput } from "../type";
import { FilterQuery } from "mongoose";

const Short = shortModel();

export const shortRouter = router({
  createShort: procedure
    .input(
      z.object({
        link: z.string().url(),
        alias: z.optional(z.string()),
      })
    )
    .mutation(async (opts) => {
      const user_id = opts.ctx.user.id;
      const { link, alias } = opts.input;

      let slug = "";

      if (alias) {
        const exists = await global.redisClient.slugExists(alias);
        if (exists) {
          throw new TRPCException(
            "BAD_REQUEST",
            "Alias not available",
            "alias"
          );
        }
      } else {
        slug = await generateSlug();
      }

      const short = new Short({
        real_url: link,
        alias: alias,
        slug: alias || slug,
        user: user_id,
        tracking: opts.ctx.cookies.tracking,
      });

      await short.save();

      await global.redisClient.setSlug(alias || slug, short);

      return short as unknown as IShortOutput;
    }),
  getHistory: procedure
    .input(z.object({ cursor: z.number().nullish() }))
    .query(async (opts) => {
      const user_id = opts.ctx.user?.id;

      const where: FilterQuery<IShort> = {};

      user_id
        ? (where.user = user_id)
        : (where.tracking = opts.ctx.cookies.tracking);

      const data = await Short.find(where)
        .skip(opts.input.cursor || 0)
        .limit(21)
        .sort("-updatedAt");

      const hasMore = data.length > 20;
      const shorts = data.slice(0, 20) as unknown as IShortOutput[];

      return { hasMore, shorts };
    }),
});
