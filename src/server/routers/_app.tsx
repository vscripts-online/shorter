import { router } from "../trpc";
import { authRouter } from "./auth";
import { publicRouter } from "./public";
import { shortRouter } from "./short";
import { userRouter } from "./user";

export const appRouter = router({
  public: publicRouter,
  short: shortRouter,
  auth: authRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
