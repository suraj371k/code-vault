import { Snippet } from "@/types/snippets";
import { useDeleteSnippets } from "@/hooks/snippets/useDeleteSnippets";
import Link from "next/link";
import { Badge } from "./ui/badge";
import toast from "react-hot-toast";
import { useCopy } from "@/hooks/useCopy";

export const SnippetCard = ({
  snippet,
  organizationSlug,
}: {
  snippet: Snippet;
  organizationSlug: string;
}) => {
  const { mutate: deleteSnippet, isPending } = useDeleteSnippets(snippet.id);
  const { copied, copy } = useCopy();

  const handleCopy = () => {
    try {
      copy(snippet.code);
    } catch (error) {
      console.log(`error in copy code ${error}`);
    }
  };

  const handleDeleteSnippet = () => {
    deleteSnippet(undefined, {
      onSuccess: () => {
        toast.success("snippet deleted");
      },
    });
  };

  // Pretty-print enum value → "TypeScript"
  const formatLang = (lang: string) =>
    lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();

  return (
    <Link
      href={`/organization/${organizationSlug}/dashboard/snippets/${snippet.id}`}
      className="group relative rounded-xl border border-zinc-800/70 bg-zinc-900/50 p-4 hover:border-teal-700/40 transition-all duration-300 cursor-pointer overflow-hidden"
      style={{
        backdropFilter: "blur(8px)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20,184,166,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="flex items-start justify-between mb-3 relative">
        {snippet.language ? (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-950/60 text-teal-400 border border-teal-800/40">
            {formatLang(snippet.language)}
          </span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800/60 text-zinc-500 border border-zinc-700/40">
            No language
          </span>
        )}
      </div>

      <p className="text-white text-sm font-semibold mb-1 relative group-hover:text-teal-100 transition-colors">
        {snippet.title}
      </p>

      {snippet.category && (
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className="text-[10px] my-2 px-2 py-0 border-zinc-700/60 text-zinc-300 bg-black/40 rounded-md"
          >
            {snippet.category}
          </Badge>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-teal-950 border border-teal-800/50 flex items-center justify-center text-[10px] font-bold text-teal-400 uppercase">
          {snippet.author?.name?.[0] ?? "?"}
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] font-medium text-zinc-300">
            {snippet.author?.name ?? "Unknown"}
          </span>
          <span className="text-[10px] text-zinc-600">
            {new Date(snippet.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800/60 flex gap-2 relative">
        <button
          onClick={(e) => {
            e.preventDefault();
            handleCopy();
          }}
          className="text-xs text-zinc-500 hover:text-teal-400 transition-colors"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            handleDeleteSnippet();
          }}
          className="text-xs text-zinc-500 hover:text-red-400 transition-colors ml-auto"
        >
          {isPending ? "Deleting…" : "Delete"}
        </button>
      </div>
    </Link>
  );
};
