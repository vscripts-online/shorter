import { z } from "zod";
import { TRPCException, generateSlug } from "../helpers/helpers";
import shortModel from "../model/short.model";
import { sessionProcedure as procedure, router } from "../trpc";
import { IShortOutput } from "../type";

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
      const user_id = opts.ctx.user?._id;
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
      });

      await short.save();

      await global.redisClient.setSlug(alias || slug, short);

      return short as unknown as IShortOutput;
    }),
});
