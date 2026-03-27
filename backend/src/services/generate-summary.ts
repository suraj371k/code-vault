import { ChatGoogle } from "@langchain/google";
import { Language } from "../generated/prisma/enums.js";

const llm = new ChatGoogle({
  apiKey: process.env.GEMINI_API_KEY!,
  model: "gemini-2.5-flash",
});

export async function generateSummary(
  language: Language | null,
  code: string
): Promise<{ summary: string[]; tags: string[] }> {
  const langLabel = language ?? "Unknown";

  const prompt = `
You are a code documentation assistant.
Analyze the following code snippet and return a one liner points.

The summary should:
- Be 3-4 points in a bullet list format
- Explain what the function does
- Explain how it works (key steps/logic)
- Mention any libraries or tools used
- Be written for a developer audience

Language: ${langLabel}
Code:
${code}

Return ONLY a valid JSON object, no markdown, no explanation:
{
  "summary": ["summary1", "summary2"],
  "tags": ["tag1", "tag2"]
}
`;

  const response = await llm.invoke(prompt);

  const text = response.content as string;
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  return parsed as { summary: string[]; tags: string[] };
}
