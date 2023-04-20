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
    .mutation(async ({ input }) => {
      prodia.key("4be08c13-40df-4e7f-99f1-003a070567de");
      let job = await prodia.createJob({
        aspect_ratio: "portrait",
        sampler: "DPM++ 2M Karras",
        model: "deliberate_v2.safetensors [10ec4b29]",
        prompt: `${input.prompt} best quality, masterpiece`,
        negative_prompt:
          "worst quality, low quality, normal quality, lowres, low resolution, cropped, out of frame, sketch, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, mutated hands and fingers, disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, jpeg artifacts, signature, watermark, username, blurry, poorly drawn hands, poorly drawn limbs, bad anatomy, deformed, amateur drawing, odd",
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
