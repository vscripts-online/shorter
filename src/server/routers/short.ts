import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sessionProcedure as procedure, router } from "./_app";
import { IShortOutput } from "../type";
import shortModel from "../model/short.model";
import { generateSlug } from "../helpers";

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

      const { redis } = opts.ctx;

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
        slug = await generateSlug(redis);
      }

      const short = new Short();
      short.real_url = link;
      short.alias = alias;
      short.slug = alias || (slug as string);
      short.user = user_id;

      await short.save();

      await redis.set(`shorter:slug:${alias || slug}`, JSON.stringify(short));

      return short as unknown as IShortOutput;
    }),
});
