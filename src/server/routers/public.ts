import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure as procedure, router } from "./_app";

export const publicRouter = router({
  availableSlug: procedure.input(z.string()).mutation(async (opts) => {
    const { redis } = opts.ctx;
    const exists = await redis.exists(`shorter:slug:${opts.input}`);
    if (exists) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Alias is not available",
      });
    }
    return true;
  }),
});
