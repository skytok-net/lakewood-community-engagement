import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
 
export const maxDuration = 30;
 
const fireworks = createOpenAI({
  apiKey: process.env.FIREWORKS_API_KEY ?? "",
  baseURL: "https://api.fireworks.ai/inference/v1",
});
 
export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: fireworks("accounts/fireworks/models/deepseek-r1"),
    messages,
  });
  return result.toDataStreamResponse();
}