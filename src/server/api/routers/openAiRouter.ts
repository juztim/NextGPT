﻿import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { Configuration, OpenAIApi } from "openai";

export const OpenAiRouter = createTRPCRouter({
  send: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().optional(),
        prompt: z.string().optional(),
        newMessage: z.string().min(2, "Message must be at least 2 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const openAiConfig = new Configuration({
          apiKey: process.env.OPENAI_API_KEY,
        });
        const openAI = new OpenAIApi(openAiConfig);

        const response = await openAI.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [{ content: input.newMessage, role: "user" }],
        });

        if (
          !response ||
          !response.data ||
          !response.data.choices ||
          response.data.choices.length === 0 ||
          !response.data.choices[0] ||
          !response.data.choices[0].message
        ) {
          throw new Error("OpenAI API Error");
        }

        if (response.status !== 200) {
          throw new Error("OpenAI API Error");
        }

        const conversation = await ctx.prisma.conversation.findUnique({
          where: {
            id: input.conversationId,
          },
        });

        if (!conversation || !input.conversationId) {
          const conversation = await ctx.prisma.conversation.create({
            data: {
              userId: ctx.session.user.id,
            },
            select: {
              id: true,
            },
          });
          await ctx.prisma.message.createMany({
            data: [
              {
                conversationId: conversation.id,
                text: input.newMessage,
                authorId: ctx.session.user.id,
              },
              {
                conversationId: conversation.id,
                text: response.data.choices[0].message.content,
              },
            ],
          });
          return { newConversation: true, conversationId: conversation.id };
        }

        await ctx.prisma.message.createMany({
          data: [
            {
              conversationId: input.conversationId,
              text: input.newMessage,
              authorId: ctx.session.user.id,
            },
            {
              conversationId: input.conversationId,
              text: response.data.choices[0].message.content,
            },
          ],
        });
      } catch (error) {
        console.log(error);
        throw new Error("Internal Server Error please try again later");
      }
    }),
  getAllChats: protectedProcedure.query(async ({ ctx }) => {
    const ungroupedChats = await ctx.prisma.conversation.findMany({
      where: {
        userId: ctx.session.user.id,
        folderId: null,
      },
    });

    const groupedChats = await ctx.prisma.conversationFolder.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        conversations: true,
      },
    });

    return { groupedChats, ungroupedChats };
  }),
  getChat: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.conversation.findUnique({
        where: {
          id: input.id,
        },
        include: {
          messages: true,
        },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid("Invalid Conversation Id"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.conversation.delete({
        where: {
          id: input.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid("Invalid Conversation Id"),
        name: z
          .string()
          .min(3, "Name must be at least 3 characters")
          .optional(),
        folderId: z.string().cuid("Invalid Folder Id").optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.conversation.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          folderId: input.folderId,
        },
      });
    }),
});
