"use client";

import React from "react";

const SUGGESTIONS = [
  "Explain this code",
  "Find potential bugs",
  "How to improve it?",
  "Add type safety",
  "Write unit tests",
  "Simplify this logic",
] as const;

interface ChatSuggestionsProps {
  onSelect: (suggestion: string) => void;
}

export const ChatSuggestions = ({ onSelect }: ChatSuggestionsProps) => {
  return (
    <div className="px-4 pt-3 pb-2">
      <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-2 font-medium">
        Quick prompts
      </p>
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className="group text-[10px] px-2.5 py-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 text-zinc-500 hover:text-teal-300 hover:border-teal-800/60 hover:bg-teal-950/40 transition-all duration-150 font-medium"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};
