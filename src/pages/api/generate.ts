import { OpenAI, OpenAIError } from "openai-streams";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request): Promise<Response> {
  const {
    messageHistory,
    temperature,
    topP,
    apiKey,
    frequencyPenalty,
    presencePenalty,
    maxLength,
  } = (await req.json()) as {
    messageHistory: {
      content: string;
      role: "user" | "system" | "assistant";
    }[];
    temperature?: number;
    topP?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    maxLength?: number;
    apiKey: string;
  };

  try {
    const stream = await OpenAI(
      "chat",
      {
        model: "gpt-3.5-turbo",
        messages: messageHistory,
        temperature: temperature ?? 0.5,
        top_p: topP ?? 0.9,
        presence_penalty: presencePenalty ?? 0,
        frequency_penalty: frequencyPenalty ?? 0,
        // max_tokens: maxLength == 0 ? undefined : maxLength ?? undefined,
      },
      { apiKey: apiKey }
    );
    return new Response(stream);
  } catch (e) {
    if (e instanceof OpenAIError) {
      return new Response(e.message, { status: 500 });
    }
    return new Response(`Unhandled Error: ${JSON.stringify(e)}`, {
      status: 500,
    });
  }
}
