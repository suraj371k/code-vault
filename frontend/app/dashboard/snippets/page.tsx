"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";

const Snippets = () => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div
      className="min-h-screen w-full bg-black relative overflow-hidden font-mono"
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(20, 184, 166, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20, 184, 166, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Radial glow — center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(20, 184, 166, 0.18) 0%, transparent 70%)",
        }}
      />

      {/* Secondary glow — bottom left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 10% 90%, rgba(6, 182, 212, 0.1) 0%, transparent 70%)",
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

        {/* Page title */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-2 h-2 rounded-full bg-teal-400"
              style={{ boxShadow: "0 0 8px rgba(45, 212, 191, 0.9)" }}
            />
            <span className="text-teal-400 text-xs tracking-widest uppercase">
              dev.vault
            </span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
            style={{ textShadow: "0 0 30px rgba(45, 212, 191, 0.3)" }}
          >
            Code Snippets
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Search, filter, and manage your saved code.
          </p>
        </div>

        {/* Header row: search + new snippet */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search bar */}
          <div className="flex-1 relative flex items-center">
            {/* Search icon */}
            <svg
              className="absolute left-3 text-zinc-500 w-4 h-4 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <Input
              className="w-full pl-10 pr-24 py-5 bg-zinc-900/70 border border-zinc-700/60 text-white placeholder-zinc-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-600 transition-all duration-200 text-sm"
              style={{
                backdropFilter: "blur(8px)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
              type="text"
              placeholder="Search snippets…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Button
              className="absolute right-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-black bg-teal-400 hover:bg-teal-300 transition-all duration-200"
              style={{
                boxShadow: "0 0 16px rgba(45, 212, 191, 0.5)",
              }}
            >
              Search
            </Button>
          </div>

          {/* New Snippet button */}
          <Button
            className="flex items-center gap-2 px-5 py-5 rounded-xl bg-zinc-900/70 border border-zinc-700/60 text-teal-400 hover:bg-zinc-800 hover:border-teal-600/50 hover:text-teal-300 transition-all duration-200 text-sm font-semibold whitespace-nowrap"
            style={{
              backdropFilter: "blur(8px)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Snippet
          </Button>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 mb-10">
          <Select>
            <SelectTrigger
              className="w-48 bg-zinc-900/70 border border-zinc-700/60 text-zinc-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500/40 focus:border-teal-600 transition-all duration-200 hover:border-zinc-500"
              style={{ backdropFilter: "blur(8px)" }}
            >
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-xl shadow-xl">
              <SelectGroup>
                <SelectLabel className="text-zinc-500 text-xs px-2 pt-1 pb-0.5 uppercase tracking-wider">
                  Languages
                </SelectLabel>
                <SelectItem value="js" className="hover:bg-zinc-800 focus:bg-zinc-800 rounded-lg cursor-pointer">
                  JavaScript
                </SelectItem>
                <SelectItem value="ts" className="hover:bg-zinc-800 focus:bg-zinc-800 rounded-lg cursor-pointer">
                  TypeScript
                </SelectItem>
                <SelectItem value="python" className="hover:bg-zinc-800 focus:bg-zinc-800 rounded-lg cursor-pointer">
                  Python
                </SelectItem>
                <SelectItem value="rust" className="hover:bg-zinc-800 focus:bg-zinc-800 rounded-lg cursor-pointer">
                  Rust
                </SelectItem>
                <SelectItem value="go" className="hover:bg-zinc-800 focus:bg-zinc-800 rounded-lg cursor-pointer">
                  Go
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger
              className="w-44 bg-zinc-900/70 border border-zinc-700/60 text-zinc-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500/40 focus:border-teal-600 transition-all duration-200 hover:border-zinc-500"
              style={{ backdropFilter: "blur(8px)" }}
            >
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-xl shadow-xl">
              <SelectGroup>
                <SelectLabel className="text-zinc-500 text-xs px-2 pt-1 pb-0.5 uppercase tracking-wider">
                  Categories
                </SelectLabel>
                <SelectItem value="utils" className="hover:bg-zinc-800 focus:bg-zinc-800 rounded-lg cursor-pointer">
                  Utilities
                </SelectItem>
                <SelectItem value="hooks" className="hover:bg-zinc-800 focus:bg-zinc-800 rounded-lg cursor-pointer">
                  Hooks
                </SelectItem>
                <SelectItem value="api" className="hover:bg-zinc-800 focus:bg-zinc-800 rounded-lg cursor-pointer">
                  API
                </SelectItem>
                <SelectItem value="ui" className="hover:bg-zinc-800 focus:bg-zinc-800 rounded-lg cursor-pointer">
                  UI
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Tag pills */}
          <div className="flex gap-2 items-center flex-wrap">
            {["All", "Favorites", "Recent"].map((tag) => (
              <button
                key={tag}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-700/60 bg-zinc-900/50 text-zinc-400 hover:border-teal-600/50 hover:text-teal-300 hover:bg-zinc-800/60 transition-all duration-200"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Snippet cards grid — placeholder cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { lang: "TypeScript", title: "useDebouncedValue", lines: 18, tag: "Hooks" },
            { lang: "Python", title: "flatten_dict()", lines: 12, tag: "Utilities" },
            { lang: "JavaScript", title: "throttle(fn, ms)", lines: 10, tag: "Utilities" },
            { lang: "Go", title: "RetryWithBackoff", lines: 25, tag: "API" },
            { lang: "TypeScript", title: "cn() classnames", lines: 6, tag: "UI" },
            { lang: "Rust", title: "parse_env_config", lines: 30, tag: "Config" },
          ].map((snippet, i) => (
            <div
              key={i}
              className="group relative rounded-xl border border-zinc-800/70 bg-zinc-900/50 p-4 hover:border-teal-700/40 transition-all duration-300 cursor-pointer overflow-hidden"
              style={{
                backdropFilter: "blur(8px)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20,184,166,0.07) 0%, transparent 70%)",
                }}
              />

              <div className="flex items-start justify-between mb-3 relative">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-950/60 text-teal-400 border border-teal-800/40">
                  {snippet.lang}
                </span>
                <span className="text-xs text-zinc-600">{snippet.lines} lines</span>
              </div>

              <p className="text-white text-sm font-semibold mb-1 relative group-hover:text-teal-100 transition-colors">
                {snippet.title}
              </p>
              <p className="text-zinc-600 text-xs relative">{snippet.tag}</p>

              <div className="mt-4 pt-3 border-t border-zinc-800/60 flex gap-2 relative">
                <button className="text-xs text-zinc-500 hover:text-teal-400 transition-colors">
                  Copy
                </button>
                <button className="text-xs text-zinc-500 hover:text-teal-400 transition-colors">
                  Edit
                </button>
                <button className="text-xs text-zinc-500 hover:text-red-400 transition-colors ml-auto">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <p className="text-center text-zinc-700 text-xs mt-12 tracking-widest uppercase">
          6 snippets · 4 languages
        </p>
      </div>
    </div>
  );
};

export default Snippets;