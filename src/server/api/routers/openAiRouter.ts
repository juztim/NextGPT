﻿import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { Configuration, OpenAIApi } from "openai";

export const OpenAiRouter = createTRPCRouter({
  // send: protectedProcedure
  //   .input(
  //     z.object({
  //       conversationId: z.string().optional(),
  //       prompt: z.string().optional(),
  //       newMessage: z.string().min(2, "Message must be at least 2 characters"),
  //       settings: z.object({
  //         temperature: z.number().min(0).max(1),
  //         tone: z.string(),
  //         writingStyle: z.string(),
  //         format: z.string(),
  //       }),
  //     })
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     try {
  //       const user = await ctx.prisma.user.findUnique({
  //         where: {
  //           id: ctx.session.user.id,
  //         },
  //         select: {
  //           apiKey: true,
  //         },
  //       });
  //
  //       if (!user || !user.apiKey) {
  //         throw new Error("No API Key");
  //       }
  //
  //       const openAiConfig = new Configuration({
  //         apiKey: user?.apiKey,
  //       });
  //       const openAI = new OpenAIApi(openAiConfig);
  //
  //       const conversation = await ctx.prisma.conversation.findUnique({
  //         where: {
  //           id: input.conversationId,
  //         },
  //       });
  //
  //       const conversationMessages = await ctx.prisma.message.findMany({
  //         where: {
  //           conversationId: input.conversationId,
  //         },
  //         select: {
  //           text: true,
  //           authorId: true,
  //         },
  //       });
  //
  //       const messageHistory: {
  //         content: string;
  //         role: "user" | "system";
  //       }[] = conversationMessages.map((message) => {
  //         return {
  //           content: message.text,
  //           role: message.authorId === ctx.session.user.id ? "user" : "system",
  //         };
  //       });
  //
  //       messageHistory.push({
  //         content: input.newMessage,
  //         role: "user",
  //       });
  //
  //       messageHistory.unshift({
  //         content: `Please respect the following instructions. Respond in a ${input.settings.tone}. Use the following writing style: ${input.settings.writingStyle}. Additionally I want you to format your response as ${input.settings.format}.`,
  //         role: "system",
  //       });
  //
  //       if (input.prompt) {
  //         messageHistory.unshift({
  //           content: input.prompt,
  //           role: "user",
  //         });
  //       }
  //
  //       // const response = await openAI.createChatCompletion({
  //       //   model: "gpt-3.5-turbo",
  //       //   messages: messageHistory,
  //       //   temperature: input.settings.temperature,
  //       // });
  //
  //       /* const stream = await OpenAI(
  //         "chat",
  //         {
  //           model: "gpt-3.5-turbo",
  //           messages: messageHistory,
  //           temperature: input.settings.temperature,
  //         },
  //         {
  //           apiKey: user?.apiKey,
  //         }
  //       ); */
  //
  //       if (!conversation || !input.conversationId) {
  //         const conversation = await ctx.prisma.conversation.create({
  //           data: {
  //             userId: ctx.session.user.id,
  //             name: "New Conversation",
  //           },
  //           select: {
  //             id: true,
  //           },
  //         });
  //
  //         /* await ctx.prisma.message.createMany({
  //           data: [
  //             {
  //               conversationId: conversation.id,
  //               text: input.newMessage,
  //               authorId: ctx.session.user.id,
  //             },
  //             {
  //               conversationId: conversation.id,
  //               text: response.data.choices[0].message.content,
  //             },
  //           ],
  //         }); */
  //
  //         return { newConversation: true, conversationId: conversation.id };
  //       }
  //
  //       /* await ctx.prisma.message.createMany({
  //         data: [
  //           {
  //             conversationId: input.conversationId,
  //             text: input.newMessage,
  //             authorId: ctx.session.user.id,
  //           },
  //           {
  //             conversationId: input.conversationId,
  //             text: response.data.choices[0].message.content,
  //           },
  //         ],
  //       }); */
  //     } catch (error: any) {
  //       console.log(error);
  //       // eslint-disable-next-line
  //       throw new Error(error.message);
  //     }
  //   }),

  addMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().optional(),
        newMessage: z.string().min(1, "Message must be at least 1 character"),
        botMessage: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const existingConversation = await ctx.prisma.conversation.findUnique({
          where: {
            id: input.conversationId,
          },
          include: {
            messages: true,
          },
        });

        if (!existingConversation || input.conversationId === undefined) {
          throw new Error("Conversation does not exist");
        }

        await ctx.prisma.message.create({
          data: {
            conversationId: input.conversationId,
            text: input.newMessage,
            authorId: input.botMessage ? null : ctx.session.user.id,
          },
        });

        await ctx.prisma.conversation.update({
          where: {
            id: input.conversationId,
          },
          data: {
            updatedAt: new Date(),
          },
        });

        return {
          firstMessage: existingConversation.messages.length === 0,
          firstMessageContent: input.newMessage,
          conversationId: input.conversationId,
          botMessage: input.botMessage,
        };
      } catch (error: any) {
        console.log(error);
        // eslint-disable-next-line
        throw new Error(error.message);
      }
    }),
  createConversation: protectedProcedure.mutation(async ({ ctx }) => {
    const conversation = await ctx.prisma.conversation.create({
      data: {
        userId: ctx.session.user.id,
        name: "New Conversation",
      },
      select: {
        id: true,
      },
    });

    return { conversationId: conversation.id };
  }),

  getAllChats: protectedProcedure.query(async ({ ctx }) => {
    const ungroupedChats = await ctx.prisma.conversation.findMany({
      where: {
        userId: ctx.session.user.id,
        folderId: null,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const groupedChats = await ctx.prisma.conversationFolder.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        conversations: {
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    return { groupedChats, ungroupedChats };
  }),
  deleteAllChats: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.conversationFolder.deleteMany({
      where: {
        userId: ctx.session.user.id,
      },
    });

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
        favorite: z.boolean().optional(),
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
          favored: input.favorite,
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
          .min(3, "Description must be at least 3 characters")
          .optional(),
        prompt: z.string().min(3, "Prompt must be at least 3 characters"),
        category: z.string().min(3, "Category must be selected"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.prompt.create({
        data: {
          name: input.title,
          description: input.description,
          instructions: input.prompt,
          category: input.category,
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
          .min(3, "Description must be at least 3 characters")
          .optional(),
        instructions: z
          .string()
          .min(3, "Instructions must be at least 3 characters"),
        category: z.string().min(3, "Category must be selected"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.character.create({
        data: {
          name: input.name,
          description: input.description,
          instructions: input.instructions,
          category: input.category,
          userId: ctx.session.user.id,
        },
      });
    }),
  deleteCharacter: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid("Invalid Character Id"),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.character.delete({
        where: {
          id: input.id,
        },
      })
    ),
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
          topP: z
            .number()
            .min(0, "Top P must be at least 0")
            .max(1, "Top P must be at most 1"),
          maxLength: z.number().optional(),
          presencePenalty: z
            .number()
            .min(-2.0, "Presence penalty must be at least -2.0")
            .max(2.0, "Presence penalty must be at most 2.0"),
          frequencyPenalty: z
            .number()
            .min(-2.0, "Frequency penalty must be at least -2.0")
            .max(2.0, "Frequency penalty must be at most 2.0"),
          tone: z.string(),
          format: z.string(),
          writingStyle: z.string(),
          outputLanguage: z.string(),
          initialInstructions: z.string(),
          showWordCount: z.boolean(),
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
            topP: input.settings.topP,
            maxLength: input.settings.maxLength,
            presencePenalty: input.settings.presencePenalty,
            frequencyPenalty: input.settings.frequencyPenalty,
            tone: input.settings.tone,
            format: input.settings.format,
            writingStyle: input.settings.writingStyle,
            outputLanguage: input.settings.outputLanguage,
            initialInstructions: input.settings.initialInstructions,
            showWordCount: input.settings.showWordCount,
          },
        });
      }
      return ctx.prisma.settings.create({
        data: {
          temperature: input.settings.temperature,
          topP: input.settings.topP,
          maxLength: input.settings.maxLength,
          presencePenalty: input.settings.presencePenalty,
          frequencyPenalty: input.settings.frequencyPenalty,
          tone: input.settings.tone,
          format: input.settings.format,
          writingStyle: input.settings.writingStyle,
          outputLanguage: input.settings.outputLanguage,
          initialInstructions: input.settings.initialInstructions,
          showWordCount: input.settings.showWordCount,
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
  clearChat: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid("Invalid Conversation Id"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.conversation.update({
        where: {
          id: input.id,
        },
        data: {
          messages: {
            deleteMany: {},
          },
        },
      });
    }),
  getTitle: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid("Invalid Conversation Id"),
        message: z.string().min(3, "Message must be at least 3 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

      const response = await openAI.createChatCompletion({
        messages: [
          {
            content: `Generate a title containing the message's topic in a couple of clear but creative words. Message: ${input.message}. Title: `,
            role: "user",
          },
        ],
        model: "gpt-3.5-turbo",
      });

      if (
        !response.data ||
        !response.data.choices ||
        !response.data.choices[0] ||
        !response.data.choices[0].message
      ) {
        throw new Error("No response from OpenAI");
      }

      return ctx.prisma.conversation.update({
        where: {
          id: input.id,
        },
        data: {
          name: response.data.choices[0].message.content,
        },
      });
    }),
});
