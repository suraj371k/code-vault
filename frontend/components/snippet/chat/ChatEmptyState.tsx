"use client";

import React from "react";
import { Bot, Sparkles } from "lucide-react";

export const ChatEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center select-none">
      {/* Animated orb */}
      <div className="relative mb-5">
        <div
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-950 to-zinc-900 border border-teal-800/50 flex items-center justify-center shadow-2xl shadow-teal-950/40"
          style={{ boxShadow: "0 0 30px rgba(20,184,166,0.12), inset 0 1px 0 rgba(45,212,191,0.1)" }}
        >
          <Bot className="w-6 h-6 text-teal-400" />
        </div>
        {/* Sparkle decorations */}
        <Sparkles
          className="absolute -top-2 -right-2 w-4 h-4 text-teal-500/40 animate-pulse"
          style={{ animationDelay: "0.3s" }}
        />
        <div
          className="absolute -bottom-1 -left-2 w-2 h-2 rounded-full bg-teal-500/30 animate-ping"
          style={{ animationDuration: "2.5s" }}
        />
      </div>

      <h3 className="text-white text-sm font-semibold tracking-tight mb-1.5">
        Ask me about this snippet
      </h3>
      <p className="text-zinc-500 text-[11px] leading-relaxed max-w-[200px]">
        I have full context of the code. Ask anything — explanations, bugs, improvements.
      </p>

      {/* Decorative dots */}
      <div className="flex gap-1.5 mt-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full bg-zinc-700 animate-pulse"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>
    </div>
  );
};
