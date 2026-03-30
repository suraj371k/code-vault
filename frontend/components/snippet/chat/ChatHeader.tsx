"use client";

import React from "react";
import { Bot, X, Zap } from "lucide-react";
import { SheetClose, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface ChatHeaderProps {
  snippetTitle: string;
  isLoading: boolean;
  messageCount: number;
}

export const ChatHeader = ({
  snippetTitle,
  isLoading,
  messageCount,
}: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60 bg-gradient-to-r from-zinc-950 to-black flex-shrink-0 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 0% 50%, rgba(20,184,166,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Left side */}
      <div className="flex items-center gap-3 relative z-10">
        {/* Avatar with status ring */}
        <div className="relative">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-950 to-zinc-900 border border-teal-800/50 flex items-center justify-center shadow-lg shadow-black/40">
            <Bot className="w-4 h-4 text-teal-400" />
          </div>
          {/* Animated status dot */}
          <span
            className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 transition-colors duration-300 ${
              isLoading
                ? "bg-amber-400 animate-pulse shadow-amber-400/40 shadow-sm"
                : "bg-teal-400 shadow-teal-400/40 shadow-sm"
            }`}
          />
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <SheetTitle className="text-white text-sm font-bold leading-tight tracking-tight">
              AI Assistant
            </SheetTitle>
            {messageCount > 1 && (
              <Badge
                variant="outline"
                className="text-[9px] h-4 px-1.5 border-zinc-700/60 text-zinc-500 bg-zinc-900/50 leading-none"
              >
                {Math.floor(messageCount / 2)} msgs
              </Badge>
            )}
          </div>
          <p className="text-zinc-500 text-[10px] leading-tight flex items-center gap-1 mt-0.5">
            {isLoading ? (
              <>
                <span className="inline-block w-1 h-1 rounded-full bg-amber-400 animate-bounce [animation-delay:0ms]" />
                <span className="inline-block w-1 h-1 rounded-full bg-amber-400 animate-bounce [animation-delay:120ms]" />
                <span className="inline-block w-1 h-1 rounded-full bg-amber-400 animate-bounce [animation-delay:240ms]" />
                <span className="ml-0.5">Thinking…</span>
              </>
            ) : (
              <>
                <Zap className="w-2.5 h-2.5 text-teal-600" />
                Gemini 2.5 Flash
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 relative z-10">
        {/* Context pill */}
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-zinc-500 bg-zinc-900/80 border border-zinc-800/60 rounded-lg px-2.5 py-1.5 max-w-[140px]">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500/70 flex-shrink-0" />
          <span className="truncate font-medium">{snippetTitle}</span>
        </div>

        {/* Close button */}
        <SheetClose asChild>
          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-white hover:bg-zinc-800/80 transition-all duration-150 border border-transparent hover:border-zinc-700/60">
            <X className="w-3.5 h-3.5" />
          </button>
        </SheetClose>
      </div>
    </div>
  );
};
