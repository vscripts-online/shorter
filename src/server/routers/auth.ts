import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { MongoServerError } from "mongodb";
import crypto from "node:crypto";
import { z } from "zod";
import { redisClient } from "../database/redis";
import userModel from "../model/user.model";
import { publicProcedure as procedure, router } from "./_app";

const User = userModel();

export const authRouter = router({
  checkEmailRegistered: procedure.input(z.string()).mutation(async (opts) => {
    const { input } = opts;

    const user = await User.findOne({ email: input });
    if (user) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Email already registered",
      });
    }
    return true;
  }),
  register: procedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(async (opts) => {
      const { input, ctx } = opts;
      const User = userModel();

      const user = new User();
      user.email = input.email;
      user.password = input.password;
      await user.save().catch((err: MongoServerError) => {
        if (err.code === 11000) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An error occured, try again later",
          });
        }
      });

      const session = crypto.randomBytes(16).toString("base64url");

      const redis = await redisClient();
      await redis.set(
        `shorter:session:${user._id}:${session}`,
        JSON.stringify(user)
      );

      const _session = user.id + "|" + session;
      ctx.resHeaders.set(
        "set-cookie",
        `session=${_session}; httpOnly;`
        // `session=${_session}; httpOnly; secure;`
      );

      return true;
    }),
  login: procedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async (opts) => {
      const { input, ctx } = opts;
      const User = userModel();

      const user = await User.findOne({ email: input.email });
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }

      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Wrong Password",
        });
      }

      const session = crypto.randomBytes(16).toString("base64url");

      const redis = await redisClient();
      await redis.set(
        `shorter:session:${user._id}:${session}`,
        JSON.stringify(user)
      );

      const _session = user.id + "|" + session;
      ctx.resHeaders.set(
        "set-cookie",
        `session=${_session}; httpOnly;`
        // `session=${_session}; httpOnly; secure;`
      );

      return true;
    }),
});
