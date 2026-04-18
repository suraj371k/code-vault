import { Request, Response } from "express";
import { ChatGoogle } from "@langchain/google";
import { prisma } from "../lib/prisma.js";
import { getWorkingModel } from "../services/helper.js";

const llm = new ChatGoogle({
  apiKey: process.env.GEMINI_API_KEY!,
  model: "gemini-2.5-flash-lite",
});

export const chatWithSnippet = async (req: Request, res: Response) => {
  try {
    // Guard: user must be authenticated (authMiddleware already ran, but double-check)
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const snippetId = Number(req.params.snippetId);
    if (!snippetId || isNaN(snippetId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid snippet ID" });
    }

    const { question } = req.body;
    if (!question || typeof question !== "string" || !question.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Question is required" });
    }

    const snippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
      select: {
        id: true,
        title: true,
        code: true,
      },
    });

    if (!snippet) {
      return res
        .status(404)
        .json({ success: false, message: "Snippet not found" });
    }

    const prompt = `You are a helpful coding assistant. Answer the user's question about the following code snippet.

Title: ${snippet.title}
Code:
\`\`\`
${snippet.code}
\`\`\`

User Question: ${question.trim()}

Keep your response concise and focused unless the user explicitly asks for a detailed explanation.`;

    // Set SSE headers BEFORE any async work so the client knows it's a stream
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    // Required for cross-origin SSE when frontend is on a different domain
    res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
    res.flushHeaders();

    // Handle client disconnect mid-stream
    let clientDisconnected = false;
    req.on("close", () => {
      clientDisconnected = true;
    });

    try {
      const workingModel = await getWorkingModel(prompt);
      const stream = await workingModel.stream(prompt);

      for await (const chunk of stream) {
        if (clientDisconnected) break;

        const text = chunk.content as string;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }
    } catch (streamError) {
      console.error("Streaming error in chatWithSnippet:", streamError);
      // Send error event to client instead of crashing silently
      if (!clientDisconnected) {
        res.write(
          `data: ${JSON.stringify({ error: "AI response failed. Please try again." })}\n\n`
        );
      }
    }

    // Signal end of stream
    if (!clientDisconnected) {
      res.write(`data: [DONE]\n\n`);
    }
    res.end();
  } catch (error) {
    console.error(`Error in chatWithSnippet controller: ${error}`);
    // If headers not sent yet, send JSON error; otherwise end the stream
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
    res.write(
      `data: ${JSON.stringify({ error: "Internal server error" })}\n\n`
    );
    res.end();
  }
};
