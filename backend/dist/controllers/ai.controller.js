import { ChatGoogle } from "@langchain/google";
import { prisma } from "../lib/prisma.js";
const llm = new ChatGoogle({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.5-flash",
});
export const chatWithSnippet = async (req, res) => {
    try {
        const snippetId = Number(req.params.snippetId);
        const { question } = req.body;
        const snippet = await prisma.snippet.findUnique({
            where: { id: snippetId },
            select: {
                id: true,
                title: true,
                code: true,
            },
        });
        const prompt = `you are a chatbot answer user ${question} about this code ${snippet?.code} and here is the name of title ${snippet?.title} keep response short until user not ask explicitly`;
        //sse headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();
        const stream = await llm.stream(prompt);
        for await (const chunk of stream) {
            const text = chunk.content;
            if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
        }
        // Signal end of stream
        res.write(`data: [DONE]\n\n`);
        res.end();
    }
    catch (error) {
        console.error(`error in chat with snippet controller: ${error}`);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
