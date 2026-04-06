"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { Users, X, Plus, Loader2 } from "lucide-react";
import { useCreateGroup } from "@/hooks/teams/useCreateGroup";
import { useGetMembers } from "@/hooks/teams/useGetMembers";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #0f766e, #0d9488)",
  "linear-gradient(135deg, #0e7490, #0891b2)",
  "linear-gradient(135deg, #4338ca, #6366f1)",
  "linear-gradient(135deg, #0f766e, #06b6d4)",
  "linear-gradient(135deg, #065f46, #059669)",
];
function avatarGradient(id: number) {
  return AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length];
}

interface CreateGroupModalProps {
  organizationId: number;
  currentUserId: number;
  onClose: () => void;
  onCreated?: () => void;
}

const CreateGroupModal = ({
  organizationId,
  currentUserId,
  onClose,
  onCreated,
}: CreateGroupModalProps) => {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [memberSearch, setMemberSearch] = useState("");

  const { mutate: createGroup, isPending } = useCreateGroup(organizationId);
  const { data: membersData, isPending: loadingMembers } =
    useGetMembers(organizationId);

  const members = (membersData?.data ?? []).filter(
    (m) => m.userId !== currentUserId,
  );

  const filtered = memberSearch.trim()
    ? members.filter(
        (m) =>
          m.user.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
          m.user.email.toLowerCase().includes(memberSearch.toLowerCase()),
      )
    : members;

  const toggleMember = (userId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleCreate = () => {
    const name = groupName.trim();
    if (!name) {
      toast.error("Group name is required");
      return;
    }
    createGroup(
      { name },
      {
        onSuccess: async (res) => {
          const groupId = res?.data?.id;
          // Add each selected member to the newly created group
          if (groupId && selectedMembers.length > 0) {
            const membersList = members.filter((m) =>
              selectedMembers.includes(m.userId),
            );
            await Promise.allSettled(
              membersList.map((m) =>
                api.post(`/api/messages/groups/org/${organizationId}/${groupId}/member`, {
                  email: m.user.email,
                }),
              ),
            );
          }
          toast.success(
            selectedMembers.length > 0
              ? `Group "${name}" created with ${selectedMembers.length} member${selectedMembers.length > 1 ? "s" : ""}!`
              : `Group "${name}" created!`,
          );
          onCreated?.();
          onClose();
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message ??
              err?.message ??
              "Failed to create group",
          );
        },
      },
    );
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0d1117 0%, #0a0a0f 100%)",
          border: "1px solid rgba(20,184,166,0.2)",
          boxShadow:
            "0 0 60px rgba(20,184,166,0.1), 0 24px 48px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "rgba(20,184,166,0.12)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="size-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(20,184,166,0.15), rgba(6,182,212,0.08))",
                border: "1px solid rgba(20,184,166,0.25)",
              }}
            >
              <Users className="size-4 text-teal-400" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-zinc-100 leading-none">
                Create Group
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Start a group conversation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <X className="size-3.5 text-zinc-500" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Group Name */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Design Team, Sprint #3…"
              className="w-full px-3 py-2.5 rounded-lg text-[13px] text-zinc-200 placeholder:text-zinc-600 outline-none transition-colors"
              style={{
                background: "rgba(20,184,166,0.05)",
                border: "1px solid rgba(20,184,166,0.15)",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "rgba(20,184,166,0.4)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "rgba(20,184,166,0.15)")
              }
            />
          </div>

          {/* Members */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                Add Members
              </label>
              {selectedMembers.length > 0 && (
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(20,184,166,0.15)",
                    color: "#2dd4bf",
                    border: "1px solid rgba(20,184,166,0.2)",
                  }}
                >
                  {selectedMembers.length} selected
                </span>
              )}
            </div>

            {/* Member search */}
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search members…"
              className="w-full px-3 py-2 rounded-lg text-[12px] text-zinc-200 placeholder:text-zinc-600 outline-none mb-2 transition-colors"
              style={{
                background: "rgba(20,184,166,0.04)",
                border: "1px solid rgba(20,184,166,0.12)",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "rgba(20,184,166,0.35)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "rgba(20,184,166,0.12)")
              }
            />

            {/* Member list */}
            <div
              className="max-h-45 overflow-y-auto space-y-0.5 pr-0.5"
              style={{ scrollbarWidth: "thin" }}
            >
              {loadingMembers &&
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg animate-pulse"
                  >
                    <div
                      className="size-7 rounded-full shrink-0"
                      style={{ background: "rgba(20,184,166,0.08)" }}
                    />
                    <div className="flex-1 space-y-1.5">
                      <div
                        className="h-2.5 w-1/2 rounded-full"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      />
                      <div
                        className="h-2 w-1/3 rounded-full"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                      />
                    </div>
                  </div>
                ))}

              {!loadingMembers && filtered.length === 0 && (
                <p className="text-[12px] text-zinc-600 text-center py-4">
                  {memberSearch
                    ? "No members found"
                    : "No other members in org"}
                </p>
              )}

              {!loadingMembers &&
                filtered.map((member) => {
                  const isSelected = selectedMembers.includes(member.userId);
                  return (
                    <button
                      key={member.userId}
                      onClick={() => toggleMember(member.userId)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all duration-150 text-left",
                        isSelected
                          ? "border border-teal-500/30"
                          : "border border-transparent hover:border-teal-900/40",
                      )}
                      style={{
                        background: isSelected
                          ? "linear-gradient(120deg, rgba(20,184,166,0.10) 0%, rgba(6,182,212,0.05) 100%)"
                          : "transparent",
                      }}
                    >
                      <Avatar
                        className="size-7 shrink-0"
                        style={{
                          boxShadow: isSelected
                            ? "0 0 0 1px rgba(20,184,166,0.4)"
                            : "0 0 0 1px rgba(255,255,255,0.06)",
                        }}
                      >
                        <AvatarFallback
                          className="text-[9px] font-bold text-teal-100"
                          style={{ background: avatarGradient(member.userId) }}
                        >
                          {getInitials(member.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-[12px] font-semibold truncate",
                            isSelected ? "text-teal-100" : "text-zinc-300",
                          )}
                        >
                          {member.user.name}
                        </p>
                        <p className="text-[10.5px] truncate text-zinc-600">
                          {member.user.email}
                        </p>
                      </div>
                      {isSelected && (
                        <div
                          className="size-4 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background:
                              "linear-gradient(135deg, #0f766e, #0d9488)",
                          }}
                        >
                          <svg
                            viewBox="0 0 10 10"
                            className="size-2.5"
                            fill="none"
                          >
                            <path
                              d="M2 5l2 2 4-4"
                              stroke="#fff"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-4 flex items-center justify-end gap-2 border-t"
          style={{ borderColor: "rgba(20,184,166,0.12)" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[12px] font-semibold text-zinc-400 transition-colors hover:text-zinc-200"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isPending || !groupName.trim()}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold text-teal-50 transition-all duration-200",
              !isPending && groupName.trim()
                ? "hover:scale-105"
                : "opacity-50 cursor-not-allowed",
            )}
            style={{
              background:
                !isPending && groupName.trim()
                  ? "linear-gradient(135deg, #0f766e, #0d9488)"
                  : "rgba(255,255,255,0.05)",
              boxShadow:
                !isPending && groupName.trim()
                  ? "0 0 16px rgba(20,184,166,0.3)"
                  : "none",
            }}
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <Plus className="size-3.5" strokeWidth={2.5} />
            )}
            {isPending ? "Creating…" : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
