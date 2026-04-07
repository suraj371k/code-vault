"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Bot, User, Copy, Check, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Msg } from "@/hooks/snippets/useAiChat";

/* ─────────────────────────────────────────────
   Customise the oneDark theme to match our UI
───────────────────────────────────────────── */
const codeTheme: Record<string, React.CSSProperties> = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: "transparent",
    margin: 0,
    padding: "1rem",
    fontSize: "12px",
    lineHeight: "1.7",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: "transparent",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: "12px",
  },
};

/* ─────────────────────────
   Inline copy button
───────────────────────── */
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 hover:text-teal-400 transition-all px-2 py-1 rounded-md hover:bg-teal-950/40"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-teal-400" />
          <span className="text-teal-400">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          Copy
        </>
      )}
    </button>
  );
};

/* ─────────────────────────────────────────────
   Fenced code block with SyntaxHighlighter
───────────────────────────────────────────── */
const CodeBlock = ({
  lang,
  code,
}: {
  lang: string;
  code: string;
}) => (
  <div className="my-3.5 rounded-xl overflow-hidden border border-zinc-700/40 bg-[#0e0e10] shadow-xl">
    {/* Header bar */}
    <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/70 border-b border-zinc-800/60">
      <div className="flex items-center gap-2">
        {/* Traffic-light dots */}
        <div className="flex gap-1.5">
          {["#ff5f57", "#ffbd2e", "#28ca41"].map((c) => (
            <span
              key={c}
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: c, opacity: 0.75 }}
            />
          ))}
        </div>
        <div className="w-px h-3 bg-zinc-700/60 mx-1" />
        <Terminal className="w-3 h-3 text-zinc-600" />
        <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
          {lang || "code"}
        </span>
      </div>
      <CopyButton text={code} />
    </div>

    {/* Syntax-highlighted code */}
    <div className="overflow-x-auto">
      <SyntaxHighlighter
        language={lang || "text"}
        style={codeTheme}
        wrapLines
        wrapLongLines={false}
        showLineNumbers={code.split("\n").length > 4}
        lineNumberStyle={{
          color: "#3f3f46",
          fontSize: "11px",
          paddingRight: "1.2em",
          minWidth: "2.5em",
          userSelect: "none",
        }}
        customStyle={{
          background: "transparent",
          margin: 0,
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   ReactMarkdown custom renderers
───────────────────────────────────────────── */
const MarkdownComponents = {
  /* Paragraph */
  p: ({ children }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-[13px] leading-[1.75] text-zinc-200 mb-2.5 last:mb-0">
      {children}
    </p>
  ),

  /* Headings */
  h1: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-[15px] font-bold text-white mt-5 mb-2.5 pb-2 border-b border-zinc-800/70 first:mt-0 tracking-tight">
      {children}
    </h1>
  ),
  h2: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-sm font-semibold text-zinc-100 mt-4 mb-2 first:mt-0 tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xs font-semibold text-teal-300 mt-3.5 mb-1.5 first:mt-0 uppercase tracking-wider">
      {children}
    </h3>
  ),

  /* Code — inline vs block */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  code: ({ inline, className, children }: any) => {
    const code = String(children).replace(/\n$/, "");
    const lang = /language-(\w+)/.exec(className || "")?.[1] ?? "";

    if (!inline && (className || code.includes("\n"))) {
      return <CodeBlock lang={lang} code={code} />;
    }

    return (
      <code className="text-teal-300 bg-teal-950/50 border border-teal-900/40 rounded-md px-1.5 py-0.5 text-[11px] font-mono">
        {children}
      </code>
    );
  },

  /* Pre wrapper — CodeBlock handles its own <pre> */
  pre: ({ children }: React.HTMLAttributes<HTMLPreElement>) => <>{children}</>,

  /* Lists */
  ul: ({ children }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-2.5 space-y-1.5 pl-0">{children}</ul>
  ),
  ol: ({ children }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="my-2.5 space-y-1.5 pl-0">{children}</ol>
  ),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  li: ({ children, ordered, index }: any) => (
    <li className="flex gap-2.5 text-[13px] text-zinc-300 leading-[1.65]">
      {ordered ? (
        <span className="flex-shrink-0 w-[18px] h-[18px] rounded bg-teal-950/70 border border-teal-800/40 text-teal-400 text-[10px] font-bold flex items-center justify-center mt-[3px]">
          {(index ?? 0) + 1}
        </span>
      ) : (
        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500/50 mt-[7px]" />
      )}
      <span className="flex-1 min-w-0">{children}</span>
    </li>
  ),

  /* Blockquote */
  blockquote: ({ children }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="my-3 pl-3.5 border-l-[3px] border-teal-500/40 bg-gradient-to-r from-teal-950/25 to-transparent rounded-r-lg py-2 pr-3">
      <div className="text-[12px] text-zinc-400 italic leading-relaxed">
        {children}
      </div>
    </blockquote>
  ),

  /* Inline text styles */
  strong: ({ children }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic text-zinc-300/90">{children}</em>
  ),
  del: ({ children }: React.HTMLAttributes<HTMLElement>) => (
    <del className="line-through text-zinc-600">{children}</del>
  ),

  /* HR */
  hr: () => <hr className="my-4 border-zinc-800/50" />,

  /* Tables (GFM) */
  table: ({ children }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-3.5 overflow-x-auto rounded-xl border border-zinc-800/60 shadow-md">
      <table className="w-full text-[12px] border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-zinc-900/80">{children}</thead>
  ),
  th: ({ children }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-3.5 py-2.5 text-left text-[10px] font-semibold text-zinc-400 tracking-widest uppercase border-b border-zinc-800/70">
      {children}
    </th>
  ),
  td: ({ children }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-3.5 py-2 text-zinc-300 border-b border-zinc-800/30 last:border-0">
      {children}
    </td>
  ),
  tbody: ({ children }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className="[&>tr:hover]:bg-zinc-800/20 transition-colors">
      {children}
    </tbody>
  ),

  /* Links */
  a: ({ href, children }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-teal-400 hover:text-teal-300 underline underline-offset-2 decoration-teal-700/40 hover:decoration-teal-400/80 transition-all"
    >
      {children}
    </a>
  ),
};

/* ─────────────────────────────────────────────
   Main ChatMessage component
───────────────────────────────────────────── */
interface ChatMessageProps {
  message: Msg;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2.5", isUser ? "justify-end" : "justify-start")}>
      {/* AI avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-teal-950 to-zinc-900 border border-teal-800/50 flex items-center justify-center mt-1 shadow-sm">
          <Bot className="w-3 h-3 text-teal-400" />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[86%] rounded-2xl leading-relaxed",
          isUser
            ? "bg-gradient-to-br from-teal-500/15 to-teal-600/10 border border-teal-700/30 rounded-tr-sm px-4 py-3"
            : "bg-zinc-900/60 border border-zinc-800/50 rounded-tl-sm px-4 py-3"
        )}
        style={
          !isUser
            ? { boxShadow: "inset 0 1px 0 rgba(255,255,255,.025), 0 2px 8px rgba(0,0,0,.3)" }
            : {}
        }
      >
        {isUser ? (
          <p className="text-[13px] leading-[1.65] text-teal-100">{message.text}</p>
        ) : (
          <div>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={MarkdownComponents as object}
            >
              {message.text || "\u00a0"}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center mt-1">
          <User className="w-3 h-3 text-zinc-400" />
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Typing indicator
───────────────────────────────────────────── */
export const TypingIndicator = () => (
  <div className="flex gap-2.5 justify-start">
    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-teal-950 to-zinc-900 border border-teal-800/50 flex items-center justify-center mt-1">
      <Bot className="w-3 h-3 text-teal-400" />
    </div>
    <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-teal-500/60 animate-bounce"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  </div>
);
