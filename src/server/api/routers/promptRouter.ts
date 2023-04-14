import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const PromptRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.prompt.findMany({
      where: {
        OR: [
          {
            userId: ctx.session.user.id,
          },
          {
            userId: null,
          },
        ],
      },
    });
  }),
  get: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.prompt.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
  getAdded: protectedProcedure.query(async ({ ctx }) => {
    const added = await ctx.prisma.promptJoin.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        prompt: true,
      },
    });
    return added.map((a) => a.prompt);
  }),
  addToList: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const prompt = await ctx.prisma.prompt.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!prompt) {
        throw new Error("Prompt not found");
      }

      const promptJoin = await ctx.prisma.promptJoin.findFirst({
        where: {
          promptId: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (promptJoin) {
        throw new Error("Prompt already added");
      }

      await ctx.prisma.promptJoin.create({
        data: {
          userId: ctx.session.user.id,
          promptId: input.id,
        },
      });

      return true;
    }),
  removeFromList: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const prompt = await ctx.prisma.prompt.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!prompt) {
        throw new Error("Prompt not found");
      }

      const promptJoin = await ctx.prisma.promptJoin.findFirst({
        where: {
          promptId: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!promptJoin) {
        throw new Error("Prompt not added");
      }

      await ctx.prisma.promptJoin.delete({
        where: {
          id: promptJoin.id,
        },
      });

      return true;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const character = await ctx.prisma.prompt.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!character) {
        throw new Error("Prompt not found");
      }

      await ctx.prisma.prompt.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
