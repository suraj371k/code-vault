"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Copy, Check, Trash2, ChevronLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChatSheet,
  CodeBlock,
  SummaryPanel,
  SnippetBackground,
  SnippetSkeleton,
  CollectionPanel,
} from "@/components/snippet";

import { useSnippet } from "@/hooks/snippets/useSnippet";
import { useCopy } from "@/hooks/useCopy";
import { useDeleteSnippets } from "@/hooks/snippets/useDeleteSnippets";
import { useUpdateSnippet } from "@/hooks/snippets/useUpdateSnippet";

/* ── constants ── */
const TABS = ["Code", "Summary"] as const;
type Tab = (typeof TABS)[number];

const formatLang = (lang: string | null) =>
  lang ? lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase() : null;

/* ── Page ── */
const SnippetDetails = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const snippetId = Number(params.id);

  const { data, isPending } = useSnippet(snippetId);
  const { copied, copy } = useCopy();
  const { mutate: deleteSnippet } = useDeleteSnippets(snippetId);
  const { mutate: updateSnippet } = useUpdateSnippet(snippetId);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("Code");
  const [editedCode, setEditedCode] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (data?.code) setEditedCode(data.code);
  }, [data]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleCodeChange = (value: string) => {
    setEditedCode(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateSnippet({ code: value });
    }, 1500);
  };

  const handleDelete = () => {
    deleteSnippet(undefined, {
      onSuccess: () => {
        toast.success("Snippet deleted");
        router.push(`/organization/${slug}/dashboard/snippets`);
      },
    });
  };

  /* ── Loading ── */
  if (isPending) return <SnippetSkeleton background={<SnippetBackground />} />;

  /* ── Not found ── */
  if (!data)
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <SnippetBackground />
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

  const formattedLang = formatLang(data.language) ?? "plaintext";
  const organizationId = data.organization?.id;
  const currentCollectionIds = (data.collections ?? []).map((c) => c.id);

  return (
    <div
      className="min-h-screen w-full bg-black relative overflow-y-auto overflow-x-hidden"
      style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace" }}
    >
      <SnippetBackground />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-xs text-zinc-600">
          <Link
            href={`/organization/${slug}/dashboard/snippets`}
            className="hover:text-teal-400 transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Snippets
          </Link>
          <span className="text-zinc-800">/</span>
          <span className="text-zinc-500 truncate max-w-50">{data.title}</span>
        </nav>

        {/* Title block */}
        <div className="mb-6">
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
            className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
            style={{ textShadow: "0 0 30px rgba(45,212,191,.25)" }}
          >
            {data.title}
          </h1>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-teal-950/60 text-teal-400 border border-teal-800/40">
            {formattedLang}
          </span>
          <Badge
            variant="outline"
            className="text-[10px] px-2 py-0.5 border-zinc-700/60 text-zinc-300 bg-black/40"
          >
            {data.category}
          </Badge>
          <span className="text-zinc-800 text-xs">·</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-teal-950 border border-teal-800/50 flex items-center justify-center text-[10px] font-bold text-teal-400 uppercase">
              {data.author?.name?.[0] ?? "?"}
            </div>
            <span className="text-zinc-400 text-xs">
              {data.author?.name ?? "Unknown"}
            </span>
          </div>
          <span className="text-zinc-800 text-xs">·</span>
          <span className="text-zinc-600 text-xs">{createdDate}</span>
        </div>

        {/* Collections this snippet belongs to — pill row */}
        {currentCollectionIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-[10px] text-zinc-600 uppercase tracking-widest">
              In:
            </span>
            {(data.collections ?? []).map((col) => (
              <span
                key={col.id}
                className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-zinc-900/70 border border-zinc-800/60 text-zinc-400"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500/60" />
                {col.name}
              </span>
            ))}
          </div>
        )}

        {/* Tab switcher */}
        <div
          className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-zinc-900/60 border border-zinc-800/60 w-fit"
          style={{ backdropFilter: "blur(8px)" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? "bg-teal-400 text-black"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
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

        {/* Tab content */}
        {activeTab === "Code" && (
          <CodeBlock
            code={editedCode}
            language={formattedLang}
            onCopy={() => copy(data.code)}
            copied={copied}
            onCodeChange={handleCodeChange}
          />
        )}
        {activeTab === "Summary" && (
          <SummaryPanel tags={data.tags} summary={data.summary} />
        )}

        {/* Action row */}
        <div className="flex flex-wrap items-center gap-3 mt-6">
          {/* Copy code */}
          {activeTab === "Code" && (
            <Button
              onClick={() => copy(data.code)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-400 text-black text-xs font-semibold hover:bg-teal-300 transition-all"
              style={{ boxShadow: "0 0 18px rgba(45,212,191,.4)" }}
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

          {/* Fav + Collections */}
          {organizationId && (
            <CollectionPanel
              snippetId={snippetId}
              organizationId={Number(organizationId)}
              isFav={data.isFav}
              currentCollectionIds={currentCollectionIds}
            />
          )}

          {/* AI Chat */}
          <ChatSheet
            snippetId={snippetId}
            snippet={{
              title: data.title,
              code: data.code,
              language: data.language,
            }}
          />

          {/* Delete */}
          <Button
            onClick={handleDelete}
            variant="ghost"
            className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800/60 text-red-500/70 hover:bg-red-950/30 hover:border-red-800/40 hover:text-red-400 text-xs font-semibold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-700 text-[10px] mt-14 tracking-widest uppercase">
          {formattedLang} · {data.category} · {data.organization?.name ?? ""}
        </p>
      </div>
    </div>
  );
};

export default SnippetDetails;
