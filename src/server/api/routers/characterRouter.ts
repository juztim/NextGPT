import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const CharacterRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.character.findMany({
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
      return ctx.prisma.character.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
  getAdded: protectedProcedure.query(async ({ ctx }) => {
    const added = await ctx.prisma.characterJoin.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        character: true,
      },
    });
    return added.map((a) => a.character);
  }),
  addToList: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const character = await ctx.prisma.character.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!character) {
        throw new Error("Character not found");
      }

      const characterJoin = await ctx.prisma.characterJoin.findFirst({
        where: {
          characterId: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (characterJoin) {
        throw new Error("Character already added");
      }

      await ctx.prisma.characterJoin.create({
        data: {
          userId: ctx.session.user.id,
          characterId: input.id,
        },
      });

      return true;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const character = await ctx.prisma.character.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!character) {
        throw new Error("Character not found");
      }

      await ctx.prisma.character.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
