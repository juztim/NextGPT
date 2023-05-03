import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { ConversationChain } from "langchain/chains";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import type { HumanChatMessage, SystemChatMessage } from "langchain/schema";

export default function makeChain(
  stream: TransformStream,
  apiKey: string,
  pastMessages: (HumanChatMessage | SystemChatMessage)[]
) {
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const chat = new ChatOpenAI({
    openAIApiKey: apiKey,
    modelName: "gpt-3.5-turbo",
    streaming: true,
    callbacks: [
      {
        handleLLMNewToken(token: string) {
          void writer.write(encoder.encode(token));
        },
        handleLLMEnd() {
          void writer.close();
        },
        handleLLMError(error: Error) {
          console.error(error);
          void writer.close();
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

  return chain;
}
