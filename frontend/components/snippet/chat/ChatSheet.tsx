"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAiChat } from "@/hooks/snippets/useAiChat";
import { ChatMessage, TypingIndicator } from "../ChatMessage";

import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ChatSuggestions } from "./ChatSuggestions";
import { ChatEmptyState } from "./ChatEmptyState";
import { ResizeHandle } from "./ResizeHandle";
import { useResizable } from "./useResizable";

interface ChatSheetProps {
  snippetId: number;
  snippet: {
    title: string;
    code: string;
    language: string | null;
  };
}

export const ChatSheet = ({ snippetId, snippet }: ChatSheetProps) => {
  const { messages, input, setInput, loading, send, stop } = useAiChat(
    snippetId,
    snippet.title
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputFocusRef = useRef<HTMLTextAreaElement | null>(null);
  const { width, onMouseDown } = useResizable(440);

  /* Auto-scroll to latest message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Focus input when suggestion is clicked */
  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      setInput(suggestion);
      setTimeout(() => inputFocusRef.current?.focus(), 50);
    },
    [setInput]
  );

  const handleInputFocusRef = useCallback((el: HTMLTextAreaElement | null) => {
    inputFocusRef.current = el;
  }, []);

  /* Typing indicator: show when loading and last AI message is empty (streaming) */
  const showTypingIndicator =
    loading &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === "ai" &&
    messages[messages.length - 1]?.text === "";

  /* Only show suggestions before first user message */
  const hasUserMessage = messages.some((m) => m.role === "user");

  /* Only show empty state when there's only the initial AI greeting */
  const showEmptyState = messages.length === 1 && messages[0].role === "ai";

  return (
    <Sheet>
      {/* ── Trigger Button ── */}
      <SheetTrigger asChild>
        <Button
          className="
            group relative flex items-center gap-2
            px-4 py-2 rounded-xl
            bg-zinc-900/80 border border-teal-800/40
            text-teal-400 text-xs font-semibold
            hover:bg-teal-950/60 hover:border-teal-600/60 hover:text-teal-300
            transition-all duration-200
            overflow-hidden
          "
          style={{ backdropFilter: "blur(8px)" }}
        >
          {/* Subtle shimmer */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: "linear-gradient(90deg, transparent 0%, rgba(45,212,191,0.06) 50%, transparent 100%)" }}
          />
          <Bot className="w-3.5 h-3.5 transition-transform group-hover:scale-110 relative z-10" />
          <span className="relative z-10">Ask AI</span>
          <Sparkles className="w-3 h-3 opacity-50 relative z-10 group-hover:opacity-80 transition-opacity" />
        </Button>
      </SheetTrigger>

      {/* ── Sheet Panel ── */}
      <SheetContent
        side="right"
        showCloseButton={false}
        className="p-0 border-l border-zinc-800/70 flex flex-col overflow-hidden bg-zinc-950"
        style={{
          width: `${width}px`,
          maxWidth: "95vw",
          fontFamily: "'JetBrains Mono','Fira Code',monospace",
          boxShadow: "-12px 0 50px rgba(0,0,0,0.7), -1px 0 0 rgba(20,184,166,0.06)",
          background: "linear-gradient(180deg, #09090b 0%, #050505 100%)",
        }}
      >
        {/* Drag-to-resize handle on left edge */}
        <ResizeHandle onMouseDown={onMouseDown} />

        {/* ── Header ── */}
        <ChatHeader
          snippetTitle={snippet.title}
          isLoading={loading}
          messageCount={messages.length}
        />

        {/* ── Messages area ── */}
        <ScrollArea className="flex-1 overflow-hidden">
          {showEmptyState ? (
            <ChatEmptyState />
          ) : (
            <div className="px-4 py-4 space-y-4">
              {messages.map((m, i) => (
                <ChatMessage key={i} message={m} />
              ))}
              {showTypingIndicator && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        {/* ── Suggestion chips ── */}
        {!hasUserMessage && (
          <div className="border-t border-zinc-800/40">
            <ChatSuggestions onSelect={handleSuggestionSelect} />
          </div>
        )}

        {/* ── Input area ── */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={send}
          onStop={stop}
          isLoading={loading}
          onFocusRef={handleInputFocusRef}
        />
      </SheetContent>
    </Sheet>
  );
};
