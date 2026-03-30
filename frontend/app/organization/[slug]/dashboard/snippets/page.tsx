"use client";
import React, { useEffect, useState } from "react";
import CreateSnippetForm from "@/components/create-snippet-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { useSnippets } from "@/hooks/snippets/useSnippets";
import { useCollectionSnippets } from "@/hooks/snippets/useCollectionSnippets";
import { Snippet } from "@/types/snippets";
import { useDeleteSnippets } from "@/hooks/snippets/useDeleteSnippets";
import { useCopy } from "@/hooks/useCopy";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Plus,
  Search,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Code2,
  FileCode2,
  Loader2,
  Heart,
} from "lucide-react";
import toast from "react-hot-toast";
import { CollectionsSidebar, CollectionFilter } from "@/components/snippet";

/* ── Helpers ─────────────────────────────────────── */
const LANG_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  JAVASCRIPT: {
    bg: "rgba(234,179,8,0.12)",
    text: "#facc15",
    border: "rgba(234,179,8,0.3)",
  },
  TYPESCRIPT: {
    bg: "rgba(59,130,246,0.12)",
    text: "#60a5fa",
    border: "rgba(59,130,246,0.3)",
  },
  PYTHON: {
    bg: "rgba(34,197,94,0.12)",
    text: "#4ade80",
    border: "rgba(34,197,94,0.3)",
  },
  RUST: {
    bg: "rgba(249,115,22,0.12)",
    text: "#fb923c",
    border: "rgba(249,115,22,0.3)",
  },
  GO: {
    bg: "rgba(6,182,212,0.12)",
    text: "#22d3ee",
    border: "rgba(6,182,212,0.3)",
  },
  HTML: {
    bg: "rgba(239,68,68,0.12)",
    text: "#f87171",
    border: "rgba(239,68,68,0.3)",
  },
  CSS: {
    bg: "rgba(139,92,246,0.12)",
    text: "#a78bfa",
    border: "rgba(139,92,246,0.3)",
  },
  SQL: {
    bg: "rgba(20,184,166,0.12)",
    text: "#2dd4bf",
    border: "rgba(20,184,166,0.3)",
  },
  BASH: {
    bg: "rgba(163,163,163,0.10)",
    text: "#a3a3a3",
    border: "rgba(163,163,163,0.25)",
  },
};
const defaultLangColor = {
  bg: "rgba(20,184,166,0.08)",
  text: "#5eead4",
  border: "rgba(20,184,166,0.2)",
};
const getLangColor = (lang: string | null) =>
  lang
    ? (LANG_COLORS[lang.toUpperCase()] ?? defaultLangColor)
    : defaultLangColor;

function formatLang(lang: string | null) {
  if (!lang) return "—";
  const map: Record<string, string> = {
    JAVASCRIPT: "JS",
    TYPESCRIPT: "TS",
    PYTHON: "Python",
    RUST: "Rust",
    GO: "Go",
    HTML: "HTML",
    CSS: "CSS",
    SQL: "SQL",
    BASH: "Bash",
    CSHARP: "C#",
    CPP: "C++",
    KOTLIN: "Kotlin",
    SWIFT: "Swift",
    GRAPHQL: "GraphQL",
    DOCKERFILE: "Docker",
    YAML: "YAML",
    TOML: "TOML",
  };
  return (
    map[lang.toUpperCase()] ??
    lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase()
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 30)
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

/* ── Snippet table row  */
function SnippetRow({
  snippet,
  organizationSlug,
}: {
  snippet: Snippet;
  organizationSlug: string;
}) {
  const router = useRouter();
  const { mutate: deleteSnippet, isPending: deleting } = useDeleteSnippets(
    snippet.id,
  );
  const { copied, copy } = useCopy();
  const langColor = getLangColor(snippet.language);

  return (
    <TableRow
      onClick={() =>
        router.push(
          `/organization/${organizationSlug}/dashboard/snippets/${snippet.id}`,
        )
      }
      className="group cursor-pointer border-b border-zinc-800/50 transition-all duration-150 hover:bg-teal-950/20 hover:border-teal-900/40"
    >
      {/* Lang */}
      <TableCell className="w-[90px] py-3.5 pl-4">
        <span
          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md whitespace-nowrap"
          style={{
            background: langColor.bg,
            color: langColor.text,
            border: `1px solid ${langColor.border}`,
          }}
        >
          <FileCode2 className="size-3" strokeWidth={2} />
          {formatLang(snippet.language)}
        </span>
      </TableCell>

      {/* Title */}
      <TableCell className="py-3.5 max-w-[240px]">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-zinc-100 group-hover:text-teal-100 transition-colors truncate">
            {snippet.title}
          </span>
          {snippet.isFav && (
            <Heart
              className="size-3 text-rose-400 flex-shrink-0"
              fill="currentColor"
            />
          )}
          <ExternalLink
            className="size-3 text-zinc-700 group-hover:text-teal-500 shrink-0 opacity-0 group-hover:opacity-100 transition-all"
            strokeWidth={2}
          />
        </div>
        {snippet.summary?.length > 0 && (
          <p className="text-[11px] text-zinc-600 truncate mt-0.5 max-w-[220px]">
            {snippet.summary[0]}
          </p>
        )}
      </TableCell>

      {/* Category */}
      <TableCell className="py-3.5 w-[120px]">
        {snippet.category ? (
          <Badge
            variant="outline"
            className="text-[10px] px-2 py-0.5 rounded-md font-medium border-zinc-700/60 text-zinc-400 bg-zinc-900/60"
          >
            {snippet.category}
          </Badge>
        ) : (
          <span className="text-zinc-700 text-[11px]">—</span>
        )}
      </TableCell>

      {/* Tags */}
      <TableCell className="py-3.5 w-[150px]">
        <div className="flex items-center gap-1 flex-wrap">
          {snippet.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-500 border border-zinc-700/50"
            >
              #{tag}
            </span>
          ))}
          {snippet.tags?.length > 2 && (
            <span className="text-[10px] text-zinc-600">
              +{snippet.tags.length - 2}
            </span>
          )}
          {(!snippet.tags || snippet.tags.length === 0) && (
            <span className="text-zinc-700 text-[11px]">—</span>
          )}
        </div>
      </TableCell>

      {/* Author */}
      <TableCell className="py-3.5 w-[130px]">
        <div className="flex items-center gap-2">
          <div
            className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold text-teal-300 shrink-0"
            style={{
              background: "linear-gradient(135deg,#0f766e,#0d9488)",
              boxShadow: "0 0 8px rgba(20,184,166,0.3)",
            }}
          >
            {snippet.author?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="text-[12px] text-zinc-400 truncate">
            {snippet.author?.name ?? "Unknown"}
          </span>
        </div>
      </TableCell>

      {/* Date */}
      <TableCell className="py-3.5 w-[95px]">
        <span className="text-[11px] text-zinc-600 tabular-nums">
          {timeAgo(snippet.created_at)}
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell className="py-3.5 w-[72px] pr-4">
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              copy(snippet.code);
            }}
            className="size-7 rounded-lg flex items-center justify-center hover:bg-teal-950/60 hover:text-teal-400 text-zinc-600 transition-all"
          >
            {copied ? (
              <Check className="size-3.5 text-teal-400" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteSnippet(undefined, {
                onSuccess: () => toast.success("Snippet deleted"),
              });
            }}
            disabled={deleting}
            className="size-7 rounded-lg flex items-center justify-center hover:bg-red-950/50 hover:text-red-400 text-zinc-600 transition-all"
          >
            {deleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function SkeletonRow() {
  return (
    <TableRow className="border-b border-zinc-800/40">
      {[90, 240, 120, 150, 130, 95, 72].map((w, i) => (
        <TableCell key={i} className="py-4">
          <div
            className="h-4 rounded animate-pulse"
            style={{
              width: `${Math.floor(w * 0.6)}px`,
              background: "rgba(255,255,255,0.05)",
            }}
          />
        </TableCell>
      ))}
    </TableRow>
  );
}

/* ── Main page ───────────────────────────────────── */
const Snippets = () => {
  const params = useParams();
  const slug = params?.slug as string;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<CollectionFilter>({
    type: "all",
  });

  const { data: organization, isPending: orgLoading } = useOrganization(slug);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchValue), 400);
    return () => clearTimeout(t);
  }, [searchValue]);

  /* Reset page on filter/search change */
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, debouncedSearch]);

  const { data: snippetData, isPending: snippetLoading } = useSnippets({
    organizationId: organization?.id ?? 0,
    page: currentPage,
    search: debouncedSearch,
  });

  /* ── Collection snippets query (used when a collection is selected) */
  const { data: collectionData, isLoading: collectionLoading } =
    useCollectionSnippets(
      activeFilter.type === "collection" ? activeFilter.id : null,
    );

  /* ── Derive the snippets to display ── */
  let displaySnippets: Snippet[] = [];
  let totalSnippets = 0;
  let totalPages = 1;
  const isLoading =
    activeFilter.type === "collection" ? collectionLoading : snippetLoading;

  if (activeFilter.type === "all") {
    displaySnippets = snippetData?.data ?? [];
    totalSnippets = snippetData?.total ?? 0;
    totalPages = snippetData?.totalPages ?? 1;
  } else if (activeFilter.type === "fav") {
    const all = snippetData?.data ?? [];
    displaySnippets = all.filter((s) => s.isFav);
    totalSnippets = displaySnippets.length;
    totalPages = 1;
  } else if (activeFilter.type === "collection") {
    displaySnippets = (collectionData?.snippets as Snippet[]) ?? [];
    /* apply client-side search inside collection */
    if (debouncedSearch) {
      displaySnippets = displaySnippets.filter(
        (s) =>
          s.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          s.code.toLowerCase().includes(debouncedSearch.toLowerCase()),
      );
    }
    totalSnippets = displaySnippets.length;
    totalPages = 1;
  }

  if (orgLoading || !organization) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="size-5 text-teal-500 animate-spin" />
      </div>
    );
  }

  /* ── Filter label ── */
  const filterLabel =
    activeFilter.type === "all"
      ? "All Snippets"
      : activeFilter.type === "fav"
        ? "Favourites"
        : activeFilter.name;

  return (
    <div
      className="flex flex-col gap-5 font-mono"
      style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace" }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400"
              style={{ boxShadow: "0 0 8px rgba(45,212,191,0.9)" }}
            />
            <span className="text-teal-500 text-[10px] tracking-widest uppercase font-semibold">
              dev.vault
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Code2 className="size-6 text-teal-400" strokeWidth={2} />
            Code Snippets
          </h1>
          <p className="text-zinc-600 text-[12px] mt-0.5">
            {totalSnippets > 0
              ? `${totalSnippets} snippet${totalSnippets !== 1 ? "s" : ""} · ${filterLabel}`
              : "Search, filter, and manage your saved code."}
          </p>
        </div>

        {/* Search + New Snippet */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors focus-within:border-teal-500/40 w-52"
            style={{
              background: "rgba(20,184,166,0.04)",
              borderColor: "rgba(20,184,166,0.14)",
            }}
          >
            <Search className="size-3.5 text-zinc-600 shrink-0" />
            <Input
              type="text"
              placeholder="Search snippets…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1 bg-transparent border-0 text-[12px] text-zinc-300 placeholder:text-zinc-600 outline-none focus-visible:ring-0 p-0 h-auto"
            />
          </div>

          <Button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 h-auto rounded-xl text-[12px] font-semibold text-black transition-all hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg,#0d9488,#0f766e)",
              boxShadow: "0 0 16px rgba(20,184,166,0.35)",
            }}
          >
            <Plus className="size-3.5" strokeWidth={2.5} />
            New Snippet
          </Button>
        </div>
      </div>

      <CreateSnippetForm
        open={open}
        onOpenChange={setOpen}
        organizationId={organization.id}
      />

      {/* ── Main layout: sidebar + table ── */}
      <div className="flex gap-4 items-start">
        {/* Collections sidebar */}
        <CollectionsSidebar
          organizationId={organization.id}
          activeFilter={activeFilter}
          onFilterChange={(f) => {
            setActiveFilter(f);
            setSearchValue("");
          }}
        />

        {/* Table */}
        <div
          className="flex-1 min-w-0 rounded-xl border overflow-hidden"
          style={{
            borderColor: "rgba(20,184,166,0.12)",
            background: "#0a0a0f",
          }}
        >
          {/* Active filter chip */}
          {activeFilter.type !== "all" && (
            <div
              className="flex items-center gap-2 px-4 py-2.5 border-b"
              style={{ borderColor: "rgba(20,184,166,0.1)" }}
            >
              <span className="text-[10px] text-zinc-600 uppercase tracking-widest">
                Filter:
              </span>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border font-medium"
                style={
                  activeFilter.type === "fav"
                    ? {
                        background: "rgba(244,63,94,0.1)",
                        borderColor: "rgba(244,63,94,0.3)",
                        color: "#fb7185",
                      }
                    : {
                        background: "rgba(20,184,166,0.1)",
                        borderColor: "rgba(20,184,166,0.3)",
                        color: "#2dd4bf",
                      }
                }
              >
                {activeFilter.type === "fav" && (
                  <Heart className="size-3" fill="currentColor" />
                )}
                {filterLabel}
              </span>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow
                className="border-b hover:bg-transparent"
                style={{
                  borderColor: "rgba(20,184,166,0.12)",
                  background: "rgba(20,184,166,0.04)",
                }}
              >
                {[
                  "Lang",
                  "Title",
                  "Category",
                  "Tags",
                  "Author",
                  "Created",
                  "",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className="text-[10px] font-bold tracking-widest uppercase py-3 text-zinc-600"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : displaySnippets.length === 0 ? (
                <TableRow className="hover:bg-transparent border-0">
                  <TableCell colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="size-12 rounded-2xl flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg,rgba(20,184,166,0.08),rgba(6,182,212,0.04))",
                          border: "1px solid rgba(20,184,166,0.15)",
                        }}
                      >
                        <Code2
                          className="size-5 text-teal-700"
                          strokeWidth={1.5}
                        />
                      </div>
                      <p className="text-zinc-500 text-[13px] font-semibold">
                        {activeFilter.type === "fav"
                          ? "No favourites yet"
                          : activeFilter.type === "collection"
                            ? "No snippets in this collection"
                            : searchValue
                              ? "No snippets match your search"
                              : "No snippets yet"}
                      </p>
                      <p className="text-zinc-700 text-[11px]">
                        {activeFilter.type === "fav"
                          ? "Open any snippet and hit the ♥ button"
                          : activeFilter.type === "collection"
                            ? "Open a snippet and add it to this collection"
                            : "Create your first snippet to get started"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displaySnippets.map((snippet) => (
                  <SnippetRow
                    key={snippet.id}
                    snippet={snippet}
                    organizationSlug={organization.slug}
                  />
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination — only for "all" filter */}
          {activeFilter.type === "all" &&
            !isLoading &&
            displaySnippets.length > 0 && (
              <div
                className="flex items-center justify-between px-4 py-3 border-t"
                style={{
                  borderColor: "rgba(20,184,166,0.1)",
                  background: "rgba(20,184,166,0.02)",
                }}
              >
                <p className="text-[11px] text-zinc-700 tabular-nums">
                  Showing{" "}
                  <span className="text-zinc-500 font-semibold">
                    {displaySnippets.length}
                  </span>{" "}
                  of{" "}
                  <span className="text-zinc-500 font-semibold">
                    {totalSnippets}
                  </span>{" "}
                  snippets
                </p>

                {totalPages > 1 && (
                  <Pagination className="w-auto mx-0">
                    <PaginationContent className="gap-1">
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage((p) => p - 1);
                          }}
                          className="h-7 px-2 text-[11px] text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-lg border border-zinc-800 bg-transparent"
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={page === currentPage}
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              className="h-7 w-7 text-[11px] rounded-lg border transition-all"
                              style={
                                page === currentPage
                                  ? {
                                      background:
                                        "linear-gradient(135deg,#0d9488,#0f766e)",
                                      borderColor: "rgba(20,184,166,0.4)",
                                      color: "#fff",
                                      boxShadow:
                                        "0 0 10px rgba(20,184,166,0.35)",
                                    }
                                  : {
                                      background: "transparent",
                                      borderColor: "rgba(255,255,255,0.07)",
                                      color: "#71717a",
                                    }
                              }
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ),
                      )}
                      {totalPages > 5 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages)
                              setCurrentPage((p) => p + 1);
                          }}
                          className="h-7 px-2 text-[11px] text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-lg border border-zinc-800 bg-transparent"
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Snippets;
