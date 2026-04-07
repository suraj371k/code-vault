"use client";

import React from "react";

export const SnippetBackground = () => (
  <>
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(rgba(20,184,166,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(20,184,166,.06) 1px,transparent 1px)`,
        backgroundSize: "40px 40px",
      }}
    />
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% 0%,rgba(20,184,166,.15) 0%,transparent 70%)",
      }}
    />
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse 50% 40% at 10% 90%,rgba(6,182,212,.08) 0%,transparent 70%)",
      }}
    />
  </>
);

interface SnippetSkeletonProps {
  background: React.ReactNode;
}

export const SnippetSkeleton = ({ background }: SnippetSkeletonProps) => (
  <div
    className="min-h-screen bg-black relative overflow-hidden"
    style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace" }}
  >
    {background}
    <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 space-y-5">
      <div className="h-3 w-28 rounded-md bg-zinc-800/70 animate-pulse" />
      <div className="h-9 w-72 rounded-md bg-zinc-800/70 animate-pulse" />
      <div className="h-3 w-52 rounded-md bg-zinc-800/70 animate-pulse" />
      <div className="h-10 w-40 rounded-xl bg-zinc-800/70 animate-pulse" />
      <div className="h-64 w-full rounded-2xl bg-zinc-800/70 animate-pulse" />
    </div>
  </div>
);
