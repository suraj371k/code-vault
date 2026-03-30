"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { Bot, Send, Square, X, GripVertical, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAiChat } from "@/hooks/snippets/useAiChat";
import { ChatMessage, TypingIndicator } from "./ChatMessage";

interface ChatSheetProps {
  snippetId: number;
  snippet: {
    title: string;
    code: string;
    language: string | null;
  };
}

const MIN_WIDTH = 320;
const MAX_WIDTH = 720;
const DEFAULT_WIDTH = 420;

export const ChatSheet = ({ snippetId, snippet }: ChatSheetProps) => {
  const { messages, input, setInput, loading, send, stop } = useAiChat(
    snippetId,
    snippet.title
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      send();
    }
  };

  /* ── Resize drag handlers ── */
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true;
      startX.current = e.clientX;
      startWidth.current = width;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startX.current - e.clientX;
      const newWidth = Math.min(
        MAX_WIDTH,
        Math.max(MIN_WIDTH, startWidth.current + delta)
      );
      setWidth(newWidth);
    };
    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const showTypingIndicator =
    loading &&
    messages.length > 0 &&
    messages[messages.length - 1]?.text === "";

  return (
    <Sheet>
      {/* Trigger button */}
      <SheetTrigger asChild>
        <Button
          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/80 border border-teal-800/40 text-teal-400 hover:bg-teal-950/50 hover:border-teal-600/60 hover:text-teal-300 transition-all duration-200 text-xs font-semibold"
          style={{ backdropFilter: "blur(8px)" }}
        >
          <Bot className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
          Ask AI
          <Sparkles className="w-3 h-3 opacity-60" />
        </Button>
      </SheetTrigger>

      {/* Panel */}
      <SheetContent
        side="right"
        showCloseButton={false}
        className="p-0 bg-zinc-950 border-l border-zinc-800/70 flex flex-col overflow-hidden"
        style={{
          width: `${width}px`,
          maxWidth: "95vw",
          fontFamily: "'JetBrains Mono','Fira Code',monospace",
          boxShadow:
            "-8px 0 40px rgba(0,0,0,0.6), -1px 0 0 rgba(20,184,166,0.08)",
        }}
      >
        {/* Visually-hidden title for screen-reader accessibility */}
        <SheetTitle className="sr-only">AI Assistant — {snippet.title}</SheetTitle>

        {/* Resize handle */}
        <div
          onMouseDown={onMouseDown}
          className="absolute left-0 top-0 bottom-0 w-4 flex items-center justify-center cursor-col-resize z-50 group/resize hover:bg-teal-500/5 transition-colors"
          title="Drag to resize"
        >
          <GripVertical className="w-3 h-3 text-zinc-700 group-hover/resize:text-teal-500/60 transition-colors" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/60 bg-black/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-teal-950 border border-teal-800/60 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <span
                className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-zinc-950 ${
                  loading ? "bg-amber-400 animate-pulse" : "bg-teal-400"
                }`}
              />
            </div>
            <div>
              <p className="text-white text-xs font-semibold leading-tight">
                AI Assistant
              </p>
              <p className="text-zinc-600 text-[10px] leading-tight">
                {loading ? "Thinking…" : "Powered by Gemini 2.5 Flash"}
              </p>
            </div>
          </div>

          {/* Snippet context pill + close */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-zinc-600 bg-zinc-900 border border-zinc-800/60 rounded-full px-2.5 py-1 max-w-[120px]">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500/60 flex-shrink-0" />
              <span className="truncate">{snippet.title}</span>
            </span>
            <SheetClose asChild>
              <button className="w-6 h-6 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 transition-all">
                <X className="w-3.5 h-3.5" />
              </button>
            </SheetClose>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 overflow-hidden">
          <div className="px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <ChatMessage key={i} message={m} />
            ))}
            {showTypingIndicator && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="px-4 pb-4 pt-3 border-t border-zinc-800/60 bg-black/10 flex-shrink-0">
          {/* Suggestion chips — shown before first user message */}
          {messages.filter((m) => m.role === "user").length === 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                "Explain this code",
                "Find potential bugs",
                "How to improve it?",
                "Add type safety",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-zinc-800/80 bg-zinc-900/50 text-zinc-500 hover:text-teal-400 hover:border-teal-800/50 hover:bg-teal-950/30 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this snippet…"
              className="flex-1 bg-zinc-900/80 border-zinc-800/60 text-white placeholder-zinc-600 text-xs rounded-xl focus-visible:ring-1 focus-visible:ring-teal-500/50 focus-visible:border-teal-700/60 h-9"
            />
            {loading ? (
              <Button
                onClick={stop}
                size="sm"
                className="h-9 px-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all"
                title="Stop generating"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                onClick={send}
                disabled={!input.trim()}
                size="sm"
                className="h-9 px-3 rounded-xl bg-teal-400 text-black hover:bg-teal-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                style={
                  input.trim()
                    ? { boxShadow: "0 0 12px rgba(45,212,191,.35)" }
                    : {}
                }
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
          <p className="text-center text-zinc-800 text-[9px] mt-2 tracking-wide">
            AI responses may be inaccurate · Always verify critical code
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
