import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { env } from "~/env.mjs";
import nodemailer from "nodemailer";

export const FeedbackRouter = createTRPCRouter({
  submitFeedback: protectedProcedure
    .input(
      z.object({
        type: z.string(),
        feedback: z.string(),
        email: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT),
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      });

      return await transporter.sendMail({
        from: `"Feedback" <${env.SMTP_FROM}>`,
        subject: `New Feedback (${input.type})`,
        html: `
            <p>${input.feedback}</p>
            <p>From: ${input.email}</p>
            `,
        to: "support@futuredesk.io",
      });
    }),
});
