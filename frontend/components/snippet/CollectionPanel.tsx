"use client";

import React, { useState } from "react";
import {
  FolderOpen,
  FolderPlus,
  Plus,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Folder,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCollections } from "@/hooks/snippets/useCollections";
import { useCreateCollection } from "@/hooks/snippets/useCreateCollection";
import { useAddSnippetToCollection } from "@/hooks/snippets/useAddSnippetToCollection";
import { useToggleFav } from "@/hooks/snippets/useToggleFav";
import { cn } from "@/lib/utils";

interface CollectionPanelProps {
  snippetId: number;
  organizationId: number;
  isFav?: boolean | null;
  currentCollectionIds?: number[];
}

export const CollectionPanel = ({
  snippetId,
  organizationId,
  isFav,
  currentCollectionIds = [],
}: CollectionPanelProps) => {
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  const { data: collections = [], isLoading } = useCollections(organizationId);
  const { mutate: createCollection, isPending: creating } = useCreateCollection();
  const { mutate: addToCollection, isPending: adding } = useAddSnippetToCollection();
  const { mutate: toggleFav, isPending: togglingFav } = useToggleFav();

  const handleCreate = () => {
    if (!newName.trim()) return;
    createCollection(
      { name: newName.trim(), organizationId },
      {
        onSuccess: () => {
          setNewName("");
          setShowCreate(false);
        },
      }
    );
  };

  const handleAdd = (colId: number) => {
    if (currentCollectionIds.includes(colId)) return;
    addToCollection({ snippetId, colId, organizationId });
  };

  const handleFav = () => {
    toggleFav({ snippetId, isFav: !!isFav, organizationId });
  };

  return (
    <div className="relative">
      {/* ── Trigger row ── */}
      <div className="flex items-center gap-2">
        {/* Favourite toggle */}
        <button
          onClick={handleFav}
          disabled={togglingFav}
          title={isFav ? "Remove from favourites" : "Add to favourites"}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-200",
            isFav
              ? "bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30"
              : "bg-zinc-900/70 border-zinc-800/60 text-zinc-500 hover:text-rose-400 hover:border-rose-800/40 hover:bg-rose-950/30"
          )}
        >
          {togglingFav ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Heart
              className="w-3.5 h-3.5"
              fill={isFav ? "currentColor" : "none"}
            />
          )}
          {isFav ? "Favourited" : "Favourite"}
        </button>

        {/* Collections dropdown trigger */}
        <button
          onClick={() => setOpen((p) => !p)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900/70 border border-zinc-800/60 text-zinc-400 hover:text-teal-400 hover:border-teal-800/40 hover:bg-teal-950/20 text-xs font-semibold transition-all duration-200"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Collections
          {currentCollectionIds.length > 0 && (
            <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 text-[10px] font-bold">
              {currentCollectionIds.length}
            </span>
          )}
          {open ? (
            <ChevronUp className="w-3 h-3 ml-0.5" />
          ) : (
            <ChevronDown className="w-3 h-3 ml-0.5" />
          )}
        </button>
      </div>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          className="absolute left-[88px] top-full mt-2 w-64 rounded-2xl border border-zinc-800/70 bg-zinc-950/95 shadow-2xl z-50 overflow-hidden"
          style={{
            backdropFilter: "blur(12px)",
            boxShadow: "0 20px 60px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.04)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-xs font-semibold text-zinc-200">Save to Collection</span>
            </div>
            <button
              onClick={() => setShowCreate((p) => !p)}
              className="text-zinc-600 hover:text-teal-400 transition-colors"
              title="New collection"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Create new collection */}
          {showCreate && (
            <div className="px-3 py-2.5 border-b border-zinc-800/40 bg-teal-950/10">
              <div className="flex gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="Collection name…"
                  className="h-7 text-[11px] bg-zinc-900/80 border-zinc-700/60 text-white placeholder-zinc-600 rounded-lg focus-visible:ring-1 focus-visible:ring-teal-500/50"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={creating || !newName.trim()}
                  className="h-7 px-2.5 rounded-lg bg-teal-400 text-black hover:bg-teal-300 text-[11px] disabled:opacity-40"
                >
                  {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          )}

          {/* Collection list */}
          <div className="max-h-52 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-4 h-4 text-zinc-600 animate-spin" />
              </div>
            ) : collections.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center px-4">
                <Folder className="w-6 h-6 text-zinc-700" />
                <p className="text-[11px] text-zinc-600">No collections yet</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="text-[11px] text-teal-500 hover:text-teal-400 underline underline-offset-2"
                >
                  Create your first one
                </button>
              </div>
            ) : (
              <div className="py-1">
                {collections.map((col) => {
                  const isAdded = currentCollectionIds.includes(col.id);
                  return (
                    <button
                      key={col.id}
                      onClick={() => handleAdd(col.id)}
                      disabled={isAdded || adding}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all",
                        isAdded
                          ? "text-teal-400 cursor-default"
                          : "text-zinc-400 hover:bg-teal-950/30 hover:text-zinc-200"
                      )}
                    >
                      {isAdded ? (
                        <Check className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                      ) : (
                        <Folder className="w-3.5 h-3.5 flex-shrink-0 text-zinc-600" />
                      )}
                      <span className="text-[12px] font-medium truncate">{col.name}</span>
                      {col.snippets && (
                        <span className="ml-auto text-[10px] text-zinc-700 flex-shrink-0">
                          {col.snippets.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
