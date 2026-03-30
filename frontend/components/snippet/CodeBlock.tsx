"use client";

import React from "react";
import { Editor } from "@monaco-editor/react";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language: string;
  onCopy: () => void;
  copied: boolean;
  onCodeChange: (value: string) => void;
  readOnly?: boolean;
}

export const CodeBlock = ({
  code,
  language,
  onCopy,
  copied,
  onCodeChange,
  readOnly = false,
}: CodeBlockProps) => (
  <div
    className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 overflow-hidden"
    style={{
      backdropFilter: "blur(8px)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.03), 0 8px 40px rgba(0,0,0,.5)",
    }}
  >
    {/* Title bar */}
    <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/70 bg-black/30">
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {["#ff5f57", "#ffbd2e", "#28ca41"].map((color, i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color, opacity: 0.7 }}
            />
          ))}
        </div>
        <span className="text-[10px] text-zinc-600 font-medium tracking-wider uppercase">
          {language || "plaintext"}
        </span>
      </div>

      <button
        onClick={onCopy}
        className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-teal-400 transition-colors px-2 py-1 rounded-md hover:bg-teal-950/30"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-teal-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            Copy
          </>
        )}
      </button>
    </div>

    {/* Monaco Editor */}
    <Editor
      theme="vs-dark"
      language={(language ?? "plaintext").toLowerCase()}
      height="50vh"
      value={code}
      onValidate={() => {}}
      onChange={(value) => onCodeChange(value ?? "")}
      options={{
        readOnly,
        fontSize: 14,
        fontFamily: "JetBrains Mono, Fira Code, monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: "on",
        renderLineHighlight: "all",
        scrollbar: {
          verticalScrollbarSize: 4,
          horizontalScrollbarSize: 4,
        },
        padding: { top: 16, bottom: 16 },
        renderValidationDecorations: "off",
        glyphMargin: false,
        smoothScrolling: true,
        cursorSmoothCaretAnimation: "on",
      }}
    />
  </div>
);
