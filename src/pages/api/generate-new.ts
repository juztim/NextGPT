import { ChatOpenAI } from "langchain/chat_models/openai";
import { AIChatMessage, HumanChatMessage } from "langchain/schema";
import { NextApiRequest, NextApiResponse } from "next";
import {
  BufferMemory,
  ChatMessageHistory,
  ConversationSummaryMemory,
} from "langchain/memory";
import { LLMChain, PromptTemplate } from "langchain";
import { ConversationChain } from "langchain/chains";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "langchain/prompts";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { messageHistory, apiKey, newMessage } = (await req.body) as {
    messageHistory: {
      role: "user" | "system" | "assistant";
      content: string;
    }[];
    apiKey: string;
    newMessage: string;
  };

  const pastMessages = messageHistory.map((message) => {
    if (message.role === "user") {
      return new HumanChatMessage(message.content);
    } else {
      return new AIChatMessage(message.content);
    }
  });

  const encoder = new TextEncoder();

  res.setHeader("Content-Type", "text/stream");

  const chat = new ChatOpenAI({
    openAIApiKey: apiKey,
    modelName: "gpt-3.5-turbo",
    streaming: true,
    callbacks: [
      {
        handleLLMNewToken(token: string) {
          res.write(encoder.encode(token));
        },
      },
    ],
  });

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
      "The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know."
    ),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);

  const chain = new ConversationChain({
    memory: new BufferMemory({
      returnMessages: true,
      memoryKey: "history",
      chatHistory: new ChatMessageHistory(pastMessages),
    }),
    prompt: chatPrompt,
    llm: chat,
  });

  await chain.call({
    input: newMessage,
  });

  res.end();
}
