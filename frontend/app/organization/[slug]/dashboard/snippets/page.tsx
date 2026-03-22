"use client";
import React, { useEffect, useState } from "react";
import CreateSnippetForm from "@/components/create-snippet-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { useSnippets } from "@/hooks/snippets/useSnippets";
import { SnippetCard } from "@/components/snippet-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Snippets = () => {
  const params = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const slug = params?.slug as string;
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState<boolean>(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // fetch organization
  const { data: organization, isPending: orgLoading } = useOrganization(slug);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // fetch snippets hook
  const { data: snippetData, isPending: snippetLoading } = useSnippets({
    organizationId: organization?.id ?? 0,
    page: currentPage,
    search: searchValue,
  });

  const totalPages = snippetData?.totalPages ?? 1;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (orgLoading || !organization) {
    return <p className="text-white">Loading organization...</p>;
  }

  const skeletonCount = snippetData?.data.length ?? 6;

  if (snippetLoading) {
    return (
      <div className="min-h-screen w-full bg-black relative overflow-hidden font-mono">
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-800/70 bg-zinc-900/50 p-4 overflow-hidden"
              >
                {/* language tag */}
                <Skeleton className="h-5 w-16 rounded-md bg-zinc-800 mb-3" />

                {/* title */}
                <Skeleton className="h-4 w-3/4 rounded bg-zinc-800 mb-2" />

                {/* category badge */}
                <Skeleton className="h-4 w-20 rounded bg-zinc-800 mb-4" />

                {/* author row */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full bg-zinc-800" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-3 w-20 rounded bg-zinc-800" />
                    <Skeleton className="h-2 w-14 rounded bg-zinc-800" />
                  </div>
                </div>

                {/* action row */}
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex gap-2">
                  <Skeleton className="h-3 w-8 rounded bg-zinc-800" />
                  <Skeleton className="h-3 w-8 rounded bg-zinc-800" />
                  <Skeleton className="h-3 w-10 rounded bg-zinc-800 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
          </div>

          {/* New Snippet button */}
          <Button
            onClick={() => setOpen(true)}
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
          <CreateSnippetForm
            open={open}
            onOpenChange={setOpen}
            organizationId={organization.id}
          ></CreateSnippetForm>
        </div>

        {/* Snippet cards grid — placeholder cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {snippetData?.data.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
              <svg
                className="w-12 h-12 text-zinc-700 mb-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <p className="text-zinc-600 text-xs mt-1">
                {searchValue ? "No snippets found" : "No snippets yet"}
              </p>
            </div>
          ) : (
            snippetData?.data.map((snippet, i) => (
              <SnippetCard
                key={i}
                snippet={snippet}
                organizationSlug={organization.slug}
              />
            ))
          )}
        </div>

        {/* pagination */}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage - 1);
                }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => {
              const page = i + 1;
              return (
                <PaginationItem className="bg-" key={i}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    className={`
    rounded-lg px-3 py-1 text-sm transition-all
    ${
      page === currentPage
        ? "bg-teal-400 text-black shadow-[0_0_10px_rgba(45,212,191,0.6)]"
        : "bg-zinc-900/60 text-zinc-400 border border-zinc-700 hover:bg-zinc-800 hover:text-white"
    }
  `}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <p className="text-center text-zinc-700 text-xs mt-12 tracking-widest uppercase">
          6 snippets · 4 languages
        </p>
      </div>
    </div>
  );
};

export default Snippets;
