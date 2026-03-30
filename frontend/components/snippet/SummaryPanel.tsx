"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { FileText, Tag } from "lucide-react";

interface SummaryPanelProps {
  summary: string[];
  tags: string[];
}

export const SummaryPanel = ({ summary, tags }: SummaryPanelProps) => (
  <div
    className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 overflow-hidden"
    style={{
      backdropFilter: "blur(8px)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.03), 0 8px 40px rgba(0,0,0,.5)",
    }}
  >
    {/* Panel header */}
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-zinc-800/70 bg-black/30">
      <FileText className="w-3.5 h-3.5 text-teal-400" />
      <span className="text-xs font-semibold text-zinc-300 tracking-wide">Summary</span>
    </div>

    <div className="p-5 space-y-3">
      <ol className="space-y-2.5">
        {summary.map((s, i) => (
          <li
            key={i}
            className="flex gap-3 group"
          >
            <span className="flex-shrink-0 w-5 h-5 rounded-md bg-teal-950/80 border border-teal-800/40 text-teal-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <div className="flex-1 text-zinc-300 text-sm leading-relaxed bg-zinc-800/30 rounded-xl px-3.5 py-2.5 border border-zinc-800/40 group-hover:border-zinc-700/60 group-hover:bg-zinc-800/50 transition-all">
              <div className="prose prose-invert prose-sm max-w-none [&>p]:m-0 [&_code]:text-teal-300 [&_code]:text-xs [&_code]:bg-zinc-900/70 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded">
                <ReactMarkdown>{s}</ReactMarkdown>
              </div>
            </div>
          </li>
        ))}
      </ol>

      {tags.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Tag className="w-3 h-3 text-zinc-600" />
            <span className="text-[10px] text-zinc-600 tracking-wider uppercase">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-400/30 transition-all cursor-default"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);
