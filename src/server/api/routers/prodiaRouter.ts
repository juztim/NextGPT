import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import * as prodia from "prodia-ai";

export const ProdiaRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      prodia.key("4be08c13-40df-4e7f-99f1-003a070567de");
      let job = await prodia.createJob({
        aspect_ratio: "square",
        sampler: "Euler",
        model: "sdv1_4.ckpt [7460a6fa]",
        prompt: input.prompt,
        negative_prompt: "",
        seed: 100,
        steps: 30,
        cfg_scale: 7,
      });
      while (job.status !== "succeeded" && job.status !== "failed") {
        await new Promise((resolve) => setTimeout(resolve, 250));

        job = await prodia.getJob(job.job);
      }

      if (job.status !== "succeeded" || !job.imageUrl) {
        throw new Error("Image generation failed!");
      }

      return job.imageUrl;
    }),
});
