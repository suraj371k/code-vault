"use client";

import React, { useState } from "react";
import {
  Folder,
  FolderOpen,
  FolderPlus,
  Heart,
  LayoutGrid,
  Plus,
  Loader2,
  ChevronRight,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCollections } from "@/hooks/snippets/useCollections";
import { useCreateCollection } from "@/hooks/snippets/useCreateCollection";
import { useDeleteCollection } from "@/hooks/snippets/useDeleteCollection";
import { cn } from "@/lib/utils";

export type CollectionFilter =
  | { type: "all" }
  | { type: "fav" }
  | { type: "collection"; id: number; name: string };

interface CollectionsSidebarProps {
  organizationId: number;
  activeFilter: CollectionFilter;
  onFilterChange: (filter: CollectionFilter) => void;
}

export const CollectionsSidebar = ({
  organizationId,
  activeFilter,
  onFilterChange,
}: CollectionsSidebarProps) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  const { data: collections = [], isLoading } = useCollections(organizationId);
  const { mutate: createCollection, isPending: creating } =
    useCreateCollection();
  const { mutate: deleteCollection, isPending: deleting } =
    useDeleteCollection();

  const handleCreate = () => {
    if (!newName.trim()) return;
    createCollection(
      { name: newName.trim(), organizationId },
      {
        onSuccess: () => {
          setNewName("");
          setShowCreate(false);
        },
      },
    );
  };

  const handleDelete = (colId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCollection({ colId, organizationId });
  };

  const isAll = activeFilter.type === "all";
  const isFav = activeFilter.type === "fav";

  return (
    <div
      className="w-56 shrink-0 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden"
      style={{
        backdropFilter: "blur(8px)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.03)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-[11px] font-semibold text-zinc-300 tracking-wide uppercase">
            Collections
          </span>
        </div>
        <button
          onClick={() => setShowCreate((p) => !p)}
          title="New collection"
          className="text-zinc-600 hover:text-teal-400 transition-colors"
        >
          <FolderPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Create new */}
      {showCreate && (
        <div className="px-3 py-2.5 bg-teal-950/15 border-b border-zinc-800/40">
          <div className="flex gap-1.5">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Name…"
              className="h-7 text-[11px] bg-zinc-900 border-zinc-700/60 text-white placeholder-zinc-600 rounded-lg focus-visible:ring-1 focus-visible:ring-teal-500/50"
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="h-7 px-2 rounded-lg bg-teal-400 text-black hover:bg-teal-300 disabled:opacity-40"
            >
              {creating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Plus className="w-3 h-3" />
              )}
            </Button>
            <button
              onClick={() => setShowCreate(false)}
              className="text-zinc-700 hover:text-zinc-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Filter items */}
      <nav className="py-1">
        {/* All snippets */}
        <FilterItem
          icon={<LayoutGrid className="w-3.5 h-3.5" />}
          label="All Snippets"
          active={isAll}
          onClick={() => onFilterChange({ type: "all" })}
        />

        {/* Favourites */}
        <FilterItem
          icon={
            <Heart
              className="w-3.5 h-3.5"
              fill={isFav ? "currentColor" : "none"}
            />
          }
          label="Favourites"
          active={isFav}
          onClick={() => onFilterChange({ type: "fav" })}
          accent="rose"
        />

        {/* Divider */}
        {collections.length > 0 && (
          <div className="mx-4 my-1 border-t border-zinc-800/50" />
        )}

        {/* Collections */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 text-zinc-700 animate-spin" />
          </div>
        ) : (
          collections.map((col) => {
            const active =
              activeFilter.type === "collection" && activeFilter.id === col.id;
            return (
              <FilterItem
                key={col.id}
                icon={
                  active ? (
                    <FolderOpen className="w-3.5 h-3.5" />
                  ) : (
                    <Folder className="w-3.5 h-3.5" />
                  )
                }
                label={col.name}
                count={col.snippets?.length}
                active={active}
                onClick={() =>
                  onFilterChange({
                    type: "collection",
                    id: col.id,
                    name: col.name,
                  })
                }
                onDelete={(e) => handleDelete(col.id, e)}
                deleting={deleting}
              />
            );
          })
        )}

        {/* Empty state */}
        {!isLoading && collections.length === 0 && (
          <div className="px-4 py-4 text-center">
            <p className="text-[10px] text-zinc-700">
              No collections yet.{" "}
              <button
                onClick={() => setShowCreate(true)}
                className="text-teal-600 hover:text-teal-400 underline underline-offset-2 transition-colors"
              >
                Create one
              </button>
            </p>
          </div>
        )}
      </nav>
    </div>
  );
};

/* ── Reusable nav item  */
function FilterItem({
  icon,
  label,
  count,
  active,
  onClick,
  onDelete,
  deleting,
  accent = "teal",
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  deleting?: boolean;
  accent?: "teal" | "rose";
}) {
  const colors = {
    teal: {
      active: "bg-teal-500/10 text-teal-300 border-r-2 border-teal-400",
      inactive: "text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300",
      icon: "text-teal-400",
    },
    rose: {
      active: "bg-rose-500/10 text-rose-300 border-r-2 border-rose-400",
      inactive: "text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300",
      icon: "text-rose-400",
    },
  }[accent];

  return (
    <div className="group/item relative flex items-center">
      <button
        onClick={onClick}
        className={cn(
          "flex-1 flex items-center gap-2.5 px-4 py-2 text-left transition-all duration-150 text-[12px] font-medium",
          active ? colors.active : colors.inactive,
        )}
      >
        <span className={cn("shrink-0", active ? colors.icon : "")}>{icon}</span>
        <span className="truncate flex-1">{label}</span>
        {count !== undefined && (
          <span
            className={cn(
              "shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
              active
                ? "bg-teal-500/20 text-teal-400"
                : "bg-zinc-800/60 text-zinc-600",
            )}
          >
            {count}
          </span>
        )}
        {active && !onDelete && <ChevronRight className="w-3 h-3 shrink-0 opacity-60" />}
      </button>
      {onDelete && (
        <button
          onClick={onDelete}
          disabled={deleting}
          title="Delete collection"
          className="opacity-0 group-hover/item:opacity-100 mr-2 shrink-0 flex items-center justify-center w-5 h-5 rounded-md text-zinc-700 hover:text-red-400 hover:bg-red-950/40 transition-all duration-150"
        >
          {deleting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Trash2 className="w-3 h-3" />
          )}
        </button>
      )}
    </div>
  );
}
