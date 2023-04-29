import { OpenAI } from "openai-streams";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request): Promise<Response> {
  const { messageHistory, temperature, topP, apiKey } = (await req.json()) as {
    messageHistory: {
      content: string;
      role: "user" | "system" | "assistant";
    }[];
    temperature?: number;
    topP?: number;
    apiKey: string;
  };

  const stream = await OpenAI(
    "chat",
    {
      model: "gpt-3.5-turbo",
      messages: messageHistory,
      temperature: temperature ?? 0.5,
      top_p: topP ?? 0.9,
    },
    { apiKey: apiKey }
  );
  return new Response(stream);
}
