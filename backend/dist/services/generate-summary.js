import { ChatGoogle } from "@langchain/google";
const llm = new ChatGoogle({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.5-flash-lite",
});
const llm2 = new ChatGoogle({
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

Return ONLY a valid JSON object, no markdown, no explanation , do not say generating a summary for developer etc just return summary and tags:
{
  "summary": ["summary1", "summary2"],
  "tags": ["tag1", "tag2"]
}
`;
    let text = "";
    try {
        //  First attempt
        const response = await llm2.invoke(prompt);
        text = extractText(response.content);
    }
    catch (err) {
        console.log(" Primary model failed, switching...");
        //  Fallback attempt
        const response = await llm.invoke(prompt);
        text = extractText(response.content);
    }
    const clean = text.replace(/```json|```/g, "").trim();
    try {
        return JSON.parse(clean);
    }
    catch (err) {
        console.error("❌ JSON parse failed:", clean);
        return {
            summary: ["Failed to parse response"],
            tags: [],
        };
    }
}
function extractText(content) {
    if (typeof content === "string")
        return content;
    if (Array.isArray(content)) {
        return content.map((c) => c.text || "").join("");
    }
    return "";
}
