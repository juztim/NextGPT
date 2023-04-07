import { createTRPCRouter } from "~/server/api/trpc";
import { OpenAiRouter } from "./routers/openAiRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  openAi: OpenAiRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
