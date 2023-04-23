import { createTRPCRouter } from "~/server/api/trpc";
import { OpenAiRouter } from "./routers/openAiRouter";
import { CharacterRouter } from "~/server/api/routers/characterRouter";
import { PromptRouter } from "~/server/api/routers/promptRouter";
import { ProdiaRouter } from "~/server/api/routers/prodiaRouter";
import { stripeRouter } from "~/server/api/routers/stripeRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  openAi: OpenAiRouter,
  character: CharacterRouter,
  prompt: PromptRouter,
  prodia: ProdiaRouter,
  stripe: stripeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
