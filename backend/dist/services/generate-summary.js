import { ChatGoogle } from "@langchain/google";
const llm = new ChatGoogle({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.5-flash",
});
export async function generateSummary(language, code) {
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
    const text = response.content;
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return parsed;
}
