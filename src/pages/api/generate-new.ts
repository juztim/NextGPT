import { AIChatMessage, HumanChatMessage } from "langchain/schema";
import makeChain from "~/server/llm/makeChain";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request): Promise<Response> {
  const { messageHistory, apiKey, newMessage } = (await req.json()) as {
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

  const stream = new TransformStream();

  const chain = makeChain(stream, apiKey, pastMessages);

  void chain.call({
    input: newMessage,
  });

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}
