import { z } from "zod";
import { TRPCException } from "../helpers/helpers";
import { publicProcedure as procedure, router } from "../trpc";
import shortModel from "../model/short.model";
import { IShortOutput } from "../type";

const Short = shortModel();

export const publicRouter = router({
  availableSlug: procedure.input(z.string()).mutation(async (opts) => {
    const exists = await global.redisClient.slugExists(opts.input);
    if (exists) {
      throw new TRPCException("CONFLICT", "Alias is not available");
    }
    return true;
  }),
});
