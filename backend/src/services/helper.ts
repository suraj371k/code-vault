import { ChatGoogle } from "@langchain/google";

const llm = new ChatGoogle({
  apiKey: process.env.GEMINI_API_KEY!,
  model: "gemini-2.5-flash",
});

const llm2 = new ChatGoogle({
  apiKey: process.env.GEMINI_API_KEY!,
  model: "gemini-2.5-flash-lite",
});

export async function getWorkingModel(prompt: string) {
  try {
    // small test call (non-stream)
    await llm.invoke("ping");
    return llm;
  } catch {
    console.log(" Primary failed, using fallback");
    return llm2;
  }
}

export function extractText(content: any): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((c: any) => c.text || "").join("");
  }
  return "";
}
