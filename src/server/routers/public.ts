import { z } from "zod";
import { TRPCException } from "../helpers/helpers";
import { publicProcedure as procedure, router } from "../trpc";

export const publicRouter = router({
  availableSlug: procedure.input(z.string()).mutation(async (opts) => {
    const exists = await opts.ctx.redis.slugExists(opts.input);
    if (exists) {
      throw new TRPCException("CONFLICT", "Alias is not available");
    }
    return true;
  }),
});
