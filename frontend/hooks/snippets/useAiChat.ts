import { useState, useRef, useCallback } from "react";

export type Msg = { role: "user" | "ai"; text: string };

export const useAiChat = (snippetId: number, snippetTitle: string) => {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: `Hey! I can help you understand the "${snippetTitle}" snippet. Ask me anything about it.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);

    // Add empty AI message to stream into
    setMessages((m) => [...m, { role: "ai", text: "" }]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch(
        `https://code-snippet-backend-1m8g.onrender.com/api/ai/${snippetId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ question: text }),
          signal: abortRef.current.signal,
        },
      );

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") break;

          try {
            const { text: chunk } = JSON.parse(raw) as { text: string };
            setMessages((m) => {
              const updated = [...m];
              updated[updated.length - 1] = {
                role: "ai",
                text: updated[updated.length - 1].text + chunk,
              };
              return updated;
            });
          } catch {
            // ignore malformed chunks
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return;
      setMessages((m) => {
        const updated = [...m];
        updated[updated.length - 1] = {
          role: "ai",
          text: "Something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }, [input, loading, snippetId]);

  const stop = () => abortRef.current?.abort();

  return { messages, input, setInput, loading, send, stop };
};
