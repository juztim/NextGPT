import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { Configuration, OpenAIApi } from "openai";

export const OpenAiRouter = createTRPCRouter({
  send: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().optional(),
        prompt: z.string().optional(),
        newMessage: z.string().min(2, "Message must be at least 2 characters"),
        settings: z.object({
          temperature: z.number().min(0).max(1),
          tone: z.string(),
          writingStyle: z.string(),
          format: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.user.findUnique({
          where: {
            id: ctx.session.user.id,
          },
          select: {
            apiKey: true,
          },
        });

        if (!user || !user.apiKey) {
          throw new Error("No API Key");
        }

        const openAiConfig = new Configuration({
          apiKey: user?.apiKey,
        });
        const openAI = new OpenAIApi(openAiConfig);

        const conversation = await ctx.prisma.conversation.findUnique({
          where: {
            id: input.conversationId,
          },
        });

        const conversationMessages = await ctx.prisma.message.findMany({
          where: {
            conversationId: input.conversationId,
          },
          select: {
            text: true,
            authorId: true,
          },
        });

        const messageHistory: {
          content: string;
          role: "user" | "system";
        }[] = conversationMessages.map((message) => {
          return {
            content: message.text,
            role: message.authorId === ctx.session.user.id ? "user" : "system",
          };
        });

        messageHistory.push({
          content: input.newMessage,
          role: "user",
        });

        messageHistory.unshift({
          content: `Please respect the following instructions. Respond in a ${input.settings.tone}. Use the following writing style: ${input.settings.writingStyle}. Additionally I want you to format your response as ${input.settings.format}.`,
          role: "system",
        });

        if (input.prompt) {
          messageHistory.unshift({
            content: input.prompt,
            role: "user",
          });
        }

        const response = await openAI.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: messageHistory,
          temperature: input.settings.temperature,
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

        if (!conversation || !input.conversationId) {
          const summaryResponse = await openAI.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
              {
                content: `Summarize this question in short: ${input.newMessage}`,
                role: "user",
              },
            ],
          });

          if (
            !summaryResponse ||
            !summaryResponse.data ||
            !summaryResponse.data.choices ||
            summaryResponse.data.choices.length === 0 ||
            !summaryResponse.data.choices[0] ||
            !summaryResponse.data.choices[0].message
          ) {
            throw new Error("OpenAI API Error while summarizing");
          }

          const conversation = await ctx.prisma.conversation.create({
            data: {
              userId: ctx.session.user.id,
              name: summaryResponse.data.choices[0].message.content,
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
      } catch (error: any) {
        console.log(error);
        // eslint-disable-next-line
        throw new Error(error.message);
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
  deleteAllChats: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.conversation.deleteMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
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

  newFolder: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3, "Name must be at least 3 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.conversationFolder.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
        },
      });
    }),

  updateFolder: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid("Invalid Folder Id"),
        name: z.string().min(3, "Name must be at least 3 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.conversationFolder.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });
    }),

  deleteFolder: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid("Invalid Folder Id"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.conversationFolder.delete({
        where: {
          id: input.id,
        },
      });
    }),

  move: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid("Invalid Conversation Id"),
        folderId: z.string().cuid("Invalid Folder Id").optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.conversation.update({
        where: {
          id: input.id,
        },
        data: {
          folderId: input.folderId ?? null,
        },
      });
    }),

  createPrompt: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3, "Title must be at least 3 characters"),
        description: z
          .string()
          .min(3, "Description must be at least 3 characters"),
        prompt: z.string().min(3, "Prompt must be at least 3 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.prompt.create({
        data: {
          name: input.title,
          description: input.description,
          instructions: input.prompt,
          userId: ctx.session.user.id,
        },
      });
    }),
  getAllPrompts: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.prompt.findMany({
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
  createCharacter: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3, "Name must be at least 3 characters"),
        description: z
          .string()
          .min(3, "Description must be at least 3 characters"),
        instructions: z
          .string()
          .min(3, "Instructions must be at least 3 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.character.create({
        data: {
          name: input.name,
          description: input.description,
          instructions: input.instructions,
          userId: ctx.session.user.id,
        },
      });
    }),
  getAllCharacters: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.character.findMany({
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
  deleteCharacter: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid("Invalid Character Id"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.character.delete({
        where: {
          id: input.id,
        },
      });
    }),
  deletePrompt: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid("Invalid Prompt Id"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.prompt.delete({
        where: {
          id: input.id,
        },
      });
    }),
  setApiKey: protectedProcedure
    .input(
      z.object({
        key: z.string().min(8, "Invalid key length"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          apiKey: input.key,
        },
      });
    }),
  setSettings: protectedProcedure
    .input(
      z.object({
        settings: z.object({
          temperature: z
            .number()
            .min(0, "Temperature must be at least 0")
            .max(1, "Temperature must be at most 1"),
          tone: z.string(),
          format: z.string(),
          writingStyle: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingSettings = await ctx.prisma.settings.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
      });
      if (existingSettings) {
        return ctx.prisma.settings.update({
          where: {
            id: existingSettings.id,
          },
          data: {
            temperature: input.settings.temperature,
            tone: input.settings.tone,
            format: input.settings.format,
            writingStyle: input.settings.writingStyle,
          },
        });
      }
      return ctx.prisma.settings.create({
        data: {
          temperature: input.settings.temperature,
          tone: input.settings.tone,
          format: input.settings.format,
          writingStyle: input.settings.writingStyle,
          userId: ctx.session.user.id,
        },
      });
    }),
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.settings.findFirst({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
});
