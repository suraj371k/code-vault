"use client";

import { useGetConversations } from "@/hooks/teams/useGetConversations";
import { useProfile } from "@/hooks/auth/useProfile";
import React, { useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Conversation } from "@/types/conversations";
import {
  MessageCircle,
  Search,
  Clock,
  Plus,
  Users,
  Loader2,
  MessageSquarePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { useParams } from "next/navigation";
import { useGetMembers } from "@/hooks/teams/useGetMembers";
import { useSendPersonalMessage } from "@/hooks/teams/useSendPersonalMessage";
import { useGetUserGroups } from "@/hooks/teams/useGetUserGroups";
import CreateGroupModal from "./create-group-modal";
import toast from "react-hot-toast";
import { SkeletonItem } from "./skeleton";
import { socket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { messageQueryKeys } from "@/hooks/teams/keys";
import { useEffect } from "react";

/* ─── helpers ─── */

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
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

function getOtherParticipants(conversation: Conversation, myId: number) {
  const others = conversation.participants.filter(
    (p) => Number(p.userId) !== myId,
  );
  return others.length > 0 ? others : conversation.participants;
}

/* ─── ConversationItem ─── */

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  myId: number;
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
  myId,
}: ConversationItemProps) {
  const others = getOtherParticipants(conversation, myId);
  const primaryParticipant = others[0];
  const extraCount = others.length - 1;
  const lastMessage = conversation.messages?.[0];
  const lastMsgPrefix =
    lastMessage && Number(lastMessage.senderId) === myId
      ? "You"
      : (lastMessage?.sender?.name ?? null);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative text-left",
        isActive
          ? "border border-teal-500/25"
          : "border border-transparent hover:border-teal-900/40",
      )}
      style={
        isActive
          ? {
              background:
                "linear-gradient(120deg, rgba(20,184,166,0.10) 0%, rgba(6,182,212,0.05) 100%)",
              boxShadow: "0 0 20px rgba(20,184,166,0.07)",
            }
          : { background: "transparent" }
      }
    >
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full"
          style={{
            height: "55%",
            background: "linear-gradient(180deg, #2dd4bf, #5eead4)",
            boxShadow: "0 0 8px 2px rgba(45,212,191,0.55)",
          }}
        />
      )}

      <div className="relative shrink-0">
        <Avatar
          className="size-10"
          style={{
            boxShadow: isActive
              ? "0 0 0 1px rgba(20,184,166,0.4)"
              : "0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <AvatarFallback
            className="text-[11px] font-bold text-teal-100"
            style={{
              background: avatarGradient(primaryParticipant?.userId ?? 0),
            }}
          >
            {primaryParticipant
              ? getInitials(primaryParticipant.user.name)
              : "??"}
          </AvatarFallback>
        </Avatar>

        {extraCount > 0 && (
          <span
            className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center size-4 rounded-full text-[9px] font-bold text-teal-100 border border-[#0a0a0f]"
            style={{ background: "linear-gradient(135deg, #0f766e, #0d9488)" }}
          >
            +{extraCount}
          </span>
        )}

        <span
          className="absolute top-0 right-0 size-2.5 rounded-full border-[1.5px] border-[#0a0a0f]"
          style={{
            background: "#22c55e",
            boxShadow: "0 0 6px rgba(34,197,94,0.6)",
          }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={cn(
              "text-[13px] font-semibold truncate leading-none",
              isActive
                ? "text-teal-100"
                : "text-zinc-200 group-hover:text-zinc-100",
            )}
          >
            {others.map((p) => p.user.name).join(", ")}
          </p>

          {lastMessage && (
            <span className="text-[10px] text-zinc-600 shrink-0 flex items-center gap-0.5">
              <Clock className="size-2.5" strokeWidth={1.8} />
              {formatTime(lastMessage.createdAt)}
            </span>
          )}
        </div>

        <p
          className={cn(
            "text-[11.5px] truncate mt-1 leading-none",
            isActive
              ? "text-teal-400/70"
              : "text-zinc-500 group-hover:text-zinc-400",
          )}
        >
          {lastMessage
            ? `${lastMsgPrefix}: ${lastMessage.content}`
            : "No messages yet"}
        </p>
      </div>
    </button>
  );
}

/* ─── GroupItem ─── */

interface GroupItemProps {
  group: { id: number; name: string };
  isActive: boolean;
  onClick: () => void;
}

function GroupItem({ group, isActive, onClick }: GroupItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative text-left border",
        isActive
          ? "border-teal-500/25"
          : "border-transparent hover:border-teal-900/40",
      )}
      style={
        isActive
          ? {
              background:
                "linear-gradient(120deg, rgba(20,184,166,0.10) 0%, rgba(6,182,212,0.05) 100%)",
              boxShadow: "0 0 20px rgba(20,184,166,0.07)",
            }
          : { background: "transparent" }
      }
    >
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full"
          style={{
            height: "55%",
            background: "linear-gradient(180deg, #2dd4bf, #5eead4)",
            boxShadow: "0 0 8px 2px rgba(45,212,191,0.55)",
          }}
        />
      )}
      <div
        className="size-9 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: isActive
            ? "linear-gradient(135deg, rgba(20,184,166,0.2), rgba(6,182,212,0.1))"
            : "rgba(20,184,166,0.06)",
          border: `1px solid ${isActive ? "rgba(20,184,166,0.3)" : "rgba(20,184,166,0.1)"}`,
        }}
      >
        <Users
          className={cn(
            "size-4",
            isActive
              ? "text-teal-300"
              : "text-teal-600 group-hover:text-teal-500",
          )}
          strokeWidth={1.8}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-[12.5px] font-semibold truncate",
            isActive
              ? "text-teal-100"
              : "text-zinc-300 group-hover:text-zinc-100",
          )}
        >
          {group.name}
        </p>
        <p className="text-[11px] text-zinc-600">Group chat</p>
      </div>
    </button>
  );
}

/* ─── MemberItem ─── */

interface MemberItemProps {
  member: {
    userId: number;
    role: string;
    user: { id: number; name: string; email: string };
  };
  onStartChat: (memberId: number, memberName: string) => void;
  isStarting: boolean;
  startingId: number | null;
}

function MemberItem({
  member,
  onStartChat,
  isStarting,
  startingId,
}: MemberItemProps) {
  const busy = isStarting && startingId === member.userId;

  return (
    <button
      onClick={() => onStartChat(member.userId, member.user.name)}
      disabled={isStarting}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:border-teal-900/40 transition-all duration-200 group"
      style={{ background: "transparent" }}
    >
      <div className="relative shrink-0">
        <Avatar
          className="size-9"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" }}
        >
          <AvatarFallback
            className="text-[11px] font-bold text-teal-100"
            style={{ background: avatarGradient(member.userId) }}
          >
            {getInitials(member.user.name)}
          </AvatarFallback>
        </Avatar>
        <span
          className="absolute top-0 right-0 size-2 rounded-full border border-[#0a0a0f]"
          style={{ background: "#22c55e" }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-semibold truncate text-zinc-300 group-hover:text-zinc-100">
          {member.user.name}
        </p>
        <p className="text-[11px] truncate text-zinc-600">
          {member.user.email}
        </p>
      </div>

      <div className="shrink-0 flex items-center gap-1">
        {busy ? (
          <Loader2
            className="size-3.5 text-teal-500 animate-spin"
            strokeWidth={2}
          />
        ) : (
          <MessageSquarePlus
            className="size-3.5 text-zinc-700 group-hover:text-teal-500 transition-colors"
            strokeWidth={1.8}
          />
        )}
      </div>
    </button>
  );
}

/* ─── Section label ─── */

function SectionLabel({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center justify-between px-3 mb-1 mt-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
        {label}
      </p>
      {count !== undefined && (
        <span
          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{
            background: "rgba(20,184,166,0.10)",
            color: "#5eead4",
            border: "1px solid rgba(20,184,166,0.15)",
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

/* ─── Main component ─── */

interface ChatListProps {
  onSelect?: (conversation: Conversation) => void;
  onSelectGroup?: (group: { id: number; name: string }) => void;
  selectedId?: number;
  selectedGroupId?: number;
  currentUserId?: number;
}

const ChatList = ({
  onSelect,
  onSelectGroup,
  selectedId,
  selectedGroupId,
  currentUserId: externalId,
}: ChatListProps) => {
  const { data: profile, isPending: profileLoading } = useProfile();
  const myId = profile?.id ? Number(profile.id) : externalId;

  const params = useParams();
  const slug = params.slug as string;

  const { data: org } = useOrganization(slug);
  const orgId = org?.id ? Number(org.id) : undefined;

  // Org members (to start conversations)
  const { data: membersData } = useGetMembers(orgId);
  const orgMembers = (membersData?.data ?? []).filter((m) => m.userId !== myId);

  // Existing conversations
  const {
    data: conversations,
    isPending: loadingConversations,
    error,
  } = useGetConversations(orgId);

  // User's groups
  const { data: groupsData } = useGetUserGroups(orgId);
  const groups = groupsData?.data ?? [];

  // Send first message to start a conversation
  const { mutate: sendMessage, isPending: sendingMessage } =
    useSendPersonalMessage();
  const [startingMemberId, setStartingMemberId] = useState<number | null>(null);

  // Group modal state
  const [showGroupModal, setShowGroupModal] = useState(false);

  // Sole owner of the socket connection — manages connect/disconnect and all global listeners
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!myId) return;
    socket.connect();
    socket.emit("join", myId);

    // Refresh group list when this user is added to a group
    const handleAddedToGroup = () => {
      queryClient.invalidateQueries({ queryKey: [...messageQueryKeys.myGroups(), orgId] });
    };

    // Refresh conversation list when a new DM arrives (scoped to this org)
    const handleNewMessage = () => {
      queryClient.invalidateQueries({ queryKey: [...messageQueryKeys.conversations(), orgId] });
    };

    socket.on("addedToGroup", handleAddedToGroup);
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("addedToGroup", handleAddedToGroup);
      socket.off("newMessage", handleNewMessage);
      socket.disconnect();
    };
  }, [myId, orgId, queryClient]);

  const [search, setSearch] = useState("");

  const list = conversations?.data ?? [];

  // KEY FIX: only show skeletons while profile or conversations are actually loading
  const isLoading = loadingConversations || profileLoading;

  const filteredConversations =
    search.trim() && myId
      ? list.filter((c) => {
          const others = getOtherParticipants(c, myId);
          return others.some(
            (p) =>
              p.user.name.toLowerCase().includes(search.toLowerCase()) ||
              p.user.email.toLowerCase().includes(search.toLowerCase()),
          );
        })
      : list;

  const filteredGroups = search.trim()
    ? groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    : groups;

  const filteredMembers = search.trim()
    ? orgMembers.filter(
        (m) =>
          m.user.name.toLowerCase().includes(search.toLowerCase()) ||
          m.user.email.toLowerCase().includes(search.toLowerCase()),
      )
    : orgMembers;

  // Members who already have a conversation — hide from the "Members" section
  const membersWithConversation = new Set(
    list.flatMap((c) =>
      c.participants
        .filter((p) => Number(p.userId) !== myId)
        .map((p) => p.userId),
    ),
  );
  const newMembers = filteredMembers.filter(
    (m) => !membersWithConversation.has(m.userId),
  );

  const handleStartChat = (receiverId: number, name: string) => {
    setStartingMemberId(receiverId);
    sendMessage(
      { receiverId, content: "👋 Hey!", organizationId: orgId! },
      {
        onSuccess: (res) => {
          setStartingMemberId(null);
          toast.success(`Conversation started with ${name}`);
          if (res?.data?.message?.conversationId) {
            const newConv = list.find(
              (c) => c.id === res.data.message.conversationId,
            );
            if (newConv) onSelect?.(newConv);
          }
        },
        onError: (err: any) => {
          setStartingMemberId(null);
          toast.error(
            err?.response?.data?.message ??
              err?.message ??
              "Failed to start chat",
          );
        },
      },
    );
  };

  return (
    <>
      <div
        className="flex flex-col h-full overflow-hidden"
        style={{ background: "#0a0a0f" }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-teal-950/50 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4 text-teal-500" strokeWidth={2} />
              <h2 className="text-[13px] font-bold tracking-wide text-zinc-100">
                Messages
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Conversation count badge */}
              {list.length > 0 && (
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(20,184,166,0.15)",
                    color: "#2dd4bf",
                    border: "1px solid rgba(20,184,166,0.2)",
                  }}
                >
                  {list.length}
                </span>
              )}

              {/* Create group button */}
              {orgId && (
                <button
                  onClick={() => setShowGroupModal(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    background: "rgba(20,184,166,0.10)",
                    color: "#5eead4",
                    border: "1px solid rgba(20,184,166,0.2)",
                  }}
                  title="Create a group"
                >
                  <Plus className="size-3" strokeWidth={2.5} />
                  Group
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors duration-200 focus-within:border-teal-500/40"
            style={{
              background: "rgba(20,184,166,0.04)",
              borderColor: "rgba(20,184,166,0.12)",
            }}
          >
            <Search
              className="size-3.5 shrink-0 text-zinc-600"
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Search conversations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[12px] text-zinc-300 placeholder:text-zinc-600 outline-none"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {/* Loading skeletons */}
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)}

          {/* Error */}
          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
              <div
                className="size-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.15)",
                }}
              >
                <MessageCircle
                  className="size-4 text-red-500/70"
                  strokeWidth={1.8}
                />
              </div>
              <p className="text-[12px] text-red-400/80 font-medium">
                Failed to load
              </p>
              <p className="text-[11px] text-zinc-600">{error.message}</p>
            </div>
          )}

          {/* ── Direct Messages ── */}
          {!isLoading && !error && filteredConversations.length > 0 && (
            <>
              <SectionLabel
                label="Direct Messages"
                count={filteredConversations.length}
              />
              {filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={selectedId === conversation.id}
                  onClick={() => onSelect?.(conversation)}
                  myId={myId!}
                />
              ))}
            </>
          )}

          {/* ── Groups ── */}
          {!isLoading && !error && filteredGroups.length > 0 && (
            <>
              <SectionLabel label="Groups" count={filteredGroups.length} />
              {filteredGroups.map((group) => (
                <GroupItem
                  key={group.id}
                  group={group}
                  isActive={selectedGroupId === group.id}
                  onClick={() => onSelectGroup?.(group)}
                />
              ))}
            </>
          )}

          {/* ── Members (no existing conversation) ── */}
          {!isLoading && !error && newMembers.length > 0 && (
            <>
              <SectionLabel label="Members" count={newMembers.length} />
              {newMembers.map((member) => (
                <MemberItem
                  key={member.userId}
                  member={member}
                  onStartChat={handleStartChat}
                  isStarting={sendingMessage}
                  startingId={startingMemberId}
                />
              ))}
            </>
          )}

          {/* ── Empty state ── */}
          {!isLoading &&
            !error &&
            filteredConversations.length === 0 &&
            filteredGroups.length === 0 &&
            newMembers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
                <div
                  className="size-10 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(20,184,166,0.08), rgba(6,182,212,0.04))",
                    border: "1px solid rgba(20,184,166,0.15)",
                  }}
                >
                  {search ? (
                    <Search
                      className="size-5 text-teal-600"
                      strokeWidth={1.6}
                    />
                  ) : orgMembers.length === 0 ? (
                    <Users className="size-5 text-teal-600" strokeWidth={1.6} />
                  ) : (
                    <MessageCircle
                      className="size-5 text-teal-600"
                      strokeWidth={1.6}
                    />
                  )}
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-zinc-400">
                    {search
                      ? "No results found"
                      : orgMembers.length === 0
                        ? "No members in this organization"
                        : "No conversations yet"}
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-0.5 max-w-45">
                    {search
                      ? "Try a different name or email"
                      : orgMembers.length === 0
                        ? "Invite people to your organization to start messaging"
                        : "Select a member above to start a conversation"}
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showGroupModal && orgId && myId && (
        <CreateGroupModal
          organizationId={Number(orgId)}
          currentUserId={myId}
          onClose={() => setShowGroupModal(false)}
          onCreated={() => setShowGroupModal(false)}
        />
      )}
    </>
  );
};

export default ChatList;
