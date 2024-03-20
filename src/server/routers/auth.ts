import bcrypt from "bcrypt";
import { MongoServerError } from "mongodb";
import { z } from "zod";
import {
  TRPCException,
  newSession,
  setSessionCookie,
  syncUnloggedShorts,
} from "../helpers/helpers";
import userModel from "../model/user.model";
import { publicProcedure as procedure, router } from "../trpc";

const User = userModel();

const catchEmailConflict = (err: MongoServerError) => {
  if (err.code === 11000) {
    throw new TRPCException("CONFLICT", "An error occured, try again later");
  }
};

export const authRouter = router({
  checkEmailRegistered: procedure.input(z.string()).mutation(async (opts) => {
    const { input } = opts;

    const user = await User.findOne({ email: input });
    if (user) {
      throw new TRPCException("CONFLICT", "Email already registered");
    }

    return true;
  }),
  register: procedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(async (opts) => {
      const { input, ctx } = opts;

      const user = new User({ email: input.email, password: input.password });
      await user.save().catch(catchEmailConflict);

      await syncUnloggedShorts(user._id.toString(), ctx.cookies.tracking);

      const session = await newSession(user);
      setSessionCookie(ctx.resHeaders, session);

      return true;
    }),
  login: procedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async (opts) => {
      const { input, ctx } = opts;

      const user = await User.findOne({ email: input.email });
      if (!user) {
        throw new TRPCException("UNAUTHORIZED", "User not found");
      }

      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) {
        throw new TRPCException("UNAUTHORIZED", "Wrong Password");
      }

      await syncUnloggedShorts(user._id.toString(), ctx.cookies.tracking);

      const session = await newSession(user);
      setSessionCookie(ctx.resHeaders, session);

      return true;
    }),
});
