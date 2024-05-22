import { router } from "../trpc";
import { publicRouter } from "./public";
import { shortRouter } from "./short";
import { userRouter } from "./user";

export const appRouter = router({
  public: publicRouter,
  short: shortRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
