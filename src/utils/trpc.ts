import type { AppRouter } from "@/server/routers/trpc-router";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();
