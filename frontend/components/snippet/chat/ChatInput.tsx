"use client";

import React, { useRef, useEffect } from "react";
import { Send, Square, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  onStop: () => void;
  isLoading: boolean;
  onFocusRef?: (el: HTMLTextAreaElement | null) => void;
}

export const ChatInput = ({
  value,
  onChange,
  onSend,
  onStop,
  isLoading,
  onFocusRef,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Expose ref to parent so suggestions can focus it */
  useEffect(() => {
    onFocusRef?.(textareaRef.current);
  }, [onFocusRef]);

  /* Auto-grow textarea */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <div className="px-4 pb-4 pt-3 border-t border-zinc-800/60 bg-gradient-to-b from-zinc-950/50 to-black/60 flex-shrink-0">
      <div className="relative flex items-end gap-2">
        {/* Textarea wrapper */}
        <div className="relative flex-1 group">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about this snippet…"
            rows={1}
            className="
              w-full resize-none bg-zinc-900/70 border border-zinc-800/60 text-white
              placeholder-zinc-600 text-[12px] rounded-xl pr-3 pl-3 py-2.5
              focus-visible:ring-1 focus-visible:ring-teal-500/40
              focus-visible:border-teal-700/50
              transition-all duration-200 min-h-[40px] max-h-[120px]
              leading-relaxed overflow-y-auto
              group-hover:border-zinc-700/80
              font-mono
            "
            style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace" }}
          />
          {/* Subtle glow on focus */}
          <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: "0 0 0 1px rgba(45,212,191,0.15), 0 4px 20px rgba(45,212,191,0.05)" }}
          />
        </div>

        {/* Action button */}
        <div className="flex-shrink-0 pb-0.5">
          {isLoading ? (
            <Button
              onClick={onStop}
              size="sm"
              title="Stop generating"
              className="h-10 w-10 p-0 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 hover:text-red-300 hover:border-red-500/50 transition-all duration-150"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </Button>
          ) : (
            <Button
              onClick={onSend}
              disabled={!canSend}
              size="sm"
              title="Send message (Enter)"
              className="h-10 w-10 p-0 rounded-xl bg-teal-400 text-black hover:bg-teal-300 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150"
              style={canSend ? { boxShadow: "0 0 16px rgba(45,212,191,0.40)" } : {}}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Hint row */}
      <div className="flex items-center justify-between mt-2 px-0.5">
        <p className="text-zinc-700 text-[9px] tracking-wide">
          Press <kbd className="text-zinc-600 bg-zinc-900 border border-zinc-800 rounded px-1 py-0.5 text-[8px]">Enter</kbd> to send · <kbd className="text-zinc-600 bg-zinc-900 border border-zinc-800 rounded px-1 py-0.5 text-[8px]">Shift+Enter</kbd> for newline
        </p>
        <p className="text-zinc-800 text-[9px]">
          AI may be inaccurate
        </p>
      </div>
    </div>
  );
};
