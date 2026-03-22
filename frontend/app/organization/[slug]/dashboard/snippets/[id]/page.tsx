"use client";

import { useSnippet } from "@/hooks/snippets/useSnippet";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import {
  Copy,
  Check,
  Bot,
  Pencil,
  Trash2,
  Send,
  ChevronLeft,
} from "lucide-react";
import { useCopy } from "@/hooks/useCopy";
import { useDeleteSnippets } from "@/hooks/snippets/useDeleteSnippets";
import toast from "react-hot-toast";
import { useUpdateSnippet } from "@/hooks/snippets/useUpdateSnippet";
import { Editor, BeforeMount } from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";

const Shimmer = ({ className = "" }: { className?: string }) => (
  <div className={`rounded-md bg-zinc-800/70 animate-pulse ${className}`} />
);

const TABS = ["Code", "Summary"] as const;

const formatLang = (lang: string | null) =>
  lang ? lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase() : null;
type Tab = (typeof TABS)[number];

const Background = () => (
  <>
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(rgba(20,184,166,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(20,184,166,.07) 1px,transparent 1px)`,
        backgroundSize: "40px 40px",
      }}
    />
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% 0%,rgba(20,184,166,.18) 0%,transparent 70%)",
      }}
    />
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse 50% 40% at 10% 90%,rgba(6,182,212,.1) 0%,transparent 70%)",
      }}
    />
  </>
);

const CodeBlock = ({
  code,
  copy,
  copied,
  language,
  onCodeChange,
}: {
  code: string;
  copy: () => void;
  copied: boolean;
  language: string;
  onCodeChange: (value: string) => void;
}) => (
  <div
    className="rounded-2xl border border-zinc-800/70 bg-zinc-900/50 overflow-hidden"
    style={{
      backdropFilter: "blur(8px)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,.03),0 8px 40px rgba(0,0,0,.5)",
    }}
  >
    <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/70 bg-black/30">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-3 h-3 rounded-full bg-zinc-700/80" />
        ))}
      </div>
      <button
        onClick={copy}
        className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-teal-400 transition-colors"
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
    <div>
      <Editor
        theme="vs-dark"
        language={(language ?? "plaintext").toLowerCase()}
        height="50vh"
        value={code}
        onValidate={() => {}}
        onChange={(value) => onCodeChange(value ?? "")}
        options={{
          readOnly: false,
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
        }}
      />
    </div>
  </div>
);

/*  summary panel */
const SummaryPanel = ({ summary, tags }: { summary: string[]; tags: string[] }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
    {/* SUMMARY */}
    <div className="prose prose-invert max-w-none">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">Summary</h3>

      <ol className="list-decimal pl-6 space-y-3 marker:text-indigo-400">
        {summary.map((s, i) => (
          <li
            key={i}
            className="text-zinc-300 leading-relaxed bg-zinc-800/40 rounded-lg px-4 py-3 hover:bg-zinc-800 transition"
          >
            <ReactMarkdown>{s}</ReactMarkdown>
          </li>
        ))}
      </ol>
    </div>

    {/* TAGS */}
    <div className="mt-6 flex flex-wrap gap-2">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="px-3 py-1 text-sm rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition"
        >
          #{tag}
        </span>
      ))}
    </div>
  </div>
);

/* AI chat sheet  */
type Msg = { role: "user" | "ai"; text: string };

const ChatSheet = ({
  snippet,
}: {
  snippet: { title: string; code: string; language: string | null };
}) => {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: `Hey! I can help you understand the "${snippet.title}" snippet. Ask me anything about it.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a concise code assistant. The user is viewing this ${snippet.language ?? "unknown"} snippet titled "${snippet.title}":\n\n${snippet.code}\n\nAnswer questions about this code briefly and clearly.`,
          messages: [{ role: "user", content: text }],
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "ai", text: data.content?.[0]?.text ?? "Sorry, no response." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "ai", text: "Something went wrong. Please try again." },
      ]);
    }
    setLoading(false);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900/70 border border-teal-800/40 text-teal-400 hover:bg-teal-950/40 hover:border-teal-600/60 transition-all text-xs font-semibold"
          style={{ backdropFilter: "blur(8px)" }}
        >
          <Bot className="w-3.5 h-3.5" /> Ask AI
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:w-105 bg-zinc-950 border-l border-zinc-800/70 flex flex-col p-0"
        style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace" }}
      >
        <SheetHeader className="px-5 py-4 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full bg-teal-400"
              style={{ boxShadow: "0 0 8px rgba(45,212,191,.9)" }}
            />
            <SheetTitle className="text-white text-sm font-semibold">
              AI Assistant
            </SheetTitle>
          </div>
          <p className="text-zinc-600 text-[11px]">
            Ask anything about this snippet
          </p>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs leading-relaxed ${m.role === "user" ? "bg-teal-500/20 border border-teal-700/40 text-teal-100" : "bg-zinc-900 border border-zinc-800/60 text-zinc-300"}`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl px-4 py-3 flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className="px-4 pb-4 pt-2 border-t border-zinc-800/60 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about this snippet…"
            className="flex-1 bg-zinc-900/80 border-zinc-700/60 text-white placeholder-zinc-600 text-xs rounded-xl focus:ring-teal-500/50 focus:border-teal-600"
          />
          <Button
            onClick={send}
            disabled={loading}
            className="px-3 rounded-xl bg-teal-400 text-black hover:bg-teal-300 disabled:opacity-40"
            style={{ boxShadow: "0 0 12px rgba(45,212,191,.4)" }}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

/* MAIN PAGE */
const SnippetDetails = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const { data, isPending } = useSnippet(Number(params.id));
  const { copied, copy } = useCopy();
  const [activeTab, setActiveTab] = useState<Tab>("Code");
  const [editedCode, setEditedCode] = useState("");

  // hooks
  const { mutate: deleteSnippet } = useDeleteSnippets(Number(params.id));
  const { mutate: updateSnippet, isPending: updatePending } = useUpdateSnippet(
    Number(params.id),
  );

  const router = useRouter();

  useEffect(() => {
    if (data?.code) {
      setEditedCode(data.code);
    }
  }, [data]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleCodeChange = (value: string) => {
    setEditedCode(value);

    // clear previous timer
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      updateSnippet({ code: value });
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleDelete = () => {
    deleteSnippet(undefined, {
      onSuccess: () => {
        toast.success("snippet deleted");
        router.push(`/organization/${slug}/dashboard/snippets`);
      },
    });
  };

  if (isPending)
    return (
      <div
        className="min-h-screen bg-black relative overflow-hidden"
        style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace" }}
      >
        <Background />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 space-y-6">
          {["h-4 w-32", "h-9 w-64", "h-4 w-48", "h-64 w-full"].map((c, i) => (
            <Shimmer key={i} className={c} />
          ))}
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <Background />
        <p className="relative z-10 text-zinc-500 text-sm font-mono">
          Snippet not found.
        </p>
      </div>
    );

  const createdDate = new Date(data.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="min-h-screen w-full bg-black relative overflow-y-auto overflow-x-hidden"
      style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace" }}
    >
      <Background />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-xs text-zinc-600">
          <Link
            href={`/organization/${slug}/dashboard/snippets`}
            className="hover:text-teal-400 transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Snippets
          </Link>
          <span className="text-zinc-800">/</span>
          <span className="text-zinc-500 truncate max-w-50">{data.title}</span>
        </div>

        {/* label + title */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-2 h-2 rounded-full bg-teal-400"
            style={{ boxShadow: "0 0 8px rgba(45,212,191,.9)" }}
          />
          <span className="text-teal-400 text-xs tracking-widest uppercase">
            dev.vault / snippet
          </span>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4"
          style={{ textShadow: "0 0 30px rgba(45,212,191,.3)" }}
        >
          {data.title}
        </h1>

        {/* meta */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-teal-950/60 text-teal-400 border border-teal-800/40">
            {formatLang(data.language)}
          </span>
          <Badge
            variant="outline"
            className="text-[10px] px-2 py-0.5 border-zinc-700/60 text-zinc-300 bg-black/40"
          >
            {data.category}
          </Badge>
          <span className="text-zinc-700 text-xs">·</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-teal-950 border border-teal-800/50 flex items-center justify-center text-[10px] font-bold text-teal-400 uppercase">
              {data.author?.name?.[0] ?? "?"}
            </div>
            <span className="text-zinc-400 text-xs">
              {data.author?.name ?? "Unknown"}
            </span>
          </div>
          <span className="text-zinc-700 text-xs">·</span>
          <span className="text-zinc-600 text-xs">{createdDate}</span>
        </div>

        {/* tab filter buttons */}
        <div
          className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-zinc-900/60 border border-zinc-800/60 w-fit"
          style={{ backdropFilter: "blur(8px)" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${activeTab === tab ? "bg-teal-400 text-black" : "text-zinc-500 hover:text-zinc-300"}`}
              style={
                activeTab === tab
                  ? { boxShadow: "0 0 12px rgba(45,212,191,.35)" }
                  : {}
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {/* tab content */}
        {activeTab === "Code" && (
          <CodeBlock
            code={editedCode}
            copy={() => copy(data.code)}
            copied={copied}
            language={formatLang(data.language)}
            onCodeChange={handleCodeChange}
          />
        )}
        {activeTab === "Summary" && (
          <SummaryPanel tags={data.tags} summary={data.summary} />
        )}

        {/* action row */}
        <div className="flex flex-wrap items-center gap-3 mt-6">
          {activeTab === "Code" && (
            <Button
              onClick={() => copy(data.code)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-400 text-black text-xs font-semibold hover:bg-teal-300 transition-all"
              style={{ boxShadow: "0 0 18px rgba(45,212,191,.45)" }}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Code
                </>
              )}
            </Button>
          )}

          {/* AI chatbot */}
          <ChatSheet
            snippet={{
              title: data.title,
              code: data.code,
              language: data.language,
            }}
          />

          <Button
            onClick={() => handleDelete()}
            variant="ghost"
            className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800/60 text-red-500/70 hover:bg-red-950/30 hover:border-red-800/40 hover:text-red-400 text-xs font-semibold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>

        <p className="text-center text-zinc-700 text-xs mt-14 tracking-widest uppercase">
          {formatLang(data.language)} · {data.category} · {data.organization?.name ?? ""}
        </p>
      </div>
    </div>
  );
};

export default SnippetDetails;


