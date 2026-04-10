"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGetConversationMessages } from "@/hooks/teams/useGetConversationMessages";
import { useSendPersonalMessage } from "@/hooks/teams/useSendPersonalMessage";
import { Conversation, Message } from "@/types/conversations";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Send, Loader2, MessageCircleDashed, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { socket } from "@/lib/socket";

/* ─── helpers  */

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatMsgTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateDivider(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #0f766e, #0d9488)",
  "linear-gradient(135deg, #0e7490, #0891b2)",
  "linear-gradient(135deg, #4338ca, #6366f1)",
  "linear-gradient(135deg, #0f766e, #06b6d4)",
];
function avatarGradient(id: number) {
  return AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length];
}

/*  sub-components  */

function SkeletonBubble({ right }: { right?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-end gap-2 animate-pulse",
        right ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className="size-7 rounded-full shrink-0"
        style={{ background: "rgba(20,184,166,0.08)" }}
      />
      <div
        className="h-9 rounded-2xl"
        style={{
          width: `${120 + Math.random() * 80}px`,
          background: right
            ? "rgba(20,184,166,0.08)"
            : "rgba(255,255,255,0.05)",
        }}
      />
    </div>
  );
}

interface BubbleProps {
  message: Message;
  isMine: boolean;
  showAvatar: boolean;
  isConsecutive: boolean;
}

function MessageBubble({
  message,
  isMine,
  showAvatar,
  isConsecutive,
}: BubbleProps) {
  return (
    <div
      className={cn(
        "flex items-end gap-2 group",
        isMine ? "flex-row-reverse" : "flex-row",
        isConsecutive ? "mt-0.5" : "mt-3",
      )}
    >
      {/* Avatar */}
      <div className="shrink-0 w-7">
        {showAvatar && !isMine ? (
          <Avatar
            className="size-7"
            style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.07)" }}
          >
            <AvatarFallback
              className="text-[9px] font-bold text-teal-100"
              style={{ background: avatarGradient(message.senderId) }}
            >
              {message.sender ? getInitials(message.sender.name) : "??"}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="size-7" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "flex flex-col max-w-[68%]",
          isMine ? "items-end" : "items-start",
        )}
      >
        {/* Sender name (only for first in group, not mine) */}
        {showAvatar && !isMine && message.sender && (
          <p className="text-[10px] font-semibold text-teal-400/70 mb-1 px-1">
            {message.sender.name}
          </p>
        )}

        <div
          className={cn(
            "relative px-3.5 py-2.5 text-[13px] leading-relaxed wrap-break-word",
            isMine
              ? "rounded-t-2xl rounded-bl-2xl rounded-br-md text-zinc-100"
              : "rounded-t-2xl rounded-br-2xl rounded-bl-md text-zinc-200",
          )}
          style={
            isMine
              ? {
                  background:
                    "linear-gradient(135deg, rgba(20,184,166,0.25) 0%, rgba(6,182,212,0.18) 100%)",
                  border: "1px solid rgba(20,184,166,0.3)",
                  boxShadow: "0 2px 12px rgba(20,184,166,0.08)",
                }
              : {
                  background: "rgba(255,255,255,0.045)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }
          }
        >
          {message.content}
        </div>

        {/* Timestamp — shows on hover */}
        <span className="text-[10px] text-zinc-600 mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {formatMsgTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}

/*  main component  */

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId?: number;
  organizationId?: number;
}

const ChatWindow = ({
  conversation,
  currentUserId,
  organizationId,
}: ChatWindowProps) => {
  const { data, isPending } = useGetConversationMessages(
    conversation.id,
    organizationId,
  );
  const {
    mutate: sendMessage,
    isPending: sending,
    error,
  } = useSendPersonalMessage();

  const [text, setText] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  const messages = localMessages;

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (data?.data) setLocalMessages(data.data);
  }, [data?.data]);

  useEffect(() => {
    if (!conversation.id) return;

    const eventName = "newMessage";

    const handleNewMessage = ({ message }: { message: Message }) => {
      if (message.conversationId === conversation.id && !message.groupId) {
        setLocalMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on(eventName, handleNewMessage);

    return () => {
      socket.off(eventName, handleNewMessage);
    };
  }, [conversation.id]);

  useEffect(() => {
    if (!conversation?.id) return;

    socket.emit("joinConversation", [conversation.id]);

    console.log("Joining conversation:", conversation.id);
  }, [conversation.id]);

  // Show scroll-to-bottom button when scrolled up
  const handleScroll = () => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 200);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const receiver =
    conversation.participants.find((p) => p.userId !== currentUserId) ??
    conversation.participants[0];

  const headerTitle =
    conversation.participants
      .filter((p) => p.userId !== currentUserId)
      .map((p) => p.user.name)
      .join(", ") || "Conversation";

  const handleSend = () => {
    const content = text.trim();
    if (!content || !receiver) return;
    sendMessage(
      { receiverId: receiver.userId, content, organizationId: organizationId! },
      {
        onSuccess: (data) => {
          setText("");
          setLocalMessages((prev) => {
            if (prev.some((m) => m.id === data.data.message.id)) return prev;
            return [...prev, data.data.message];
          });
        },
        onError: (err: any) => {
          toast.error(err?.message);
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-teal-950/50 shrink-0"
        style={{
          background: "rgba(10,10,15,0.9)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="relative">
          <Avatar
            className="size-9"
            style={{ boxShadow: "0 0 0 1px rgba(20,184,166,0.3)" }}
          >
            <AvatarFallback
              className="text-[11px] font-bold text-teal-100"
              style={{ background: avatarGradient(receiver?.userId ?? 0) }}
            >
              {receiver ? getInitials(receiver.user.name) : "??"}
            </AvatarFallback>
          </Avatar>
          <span
            className="absolute bottom-0 right-0 size-2.5 rounded-full border-[1.5px] border-[#0a0a0f]"
            style={{
              background: "#22c55e",
              boxShadow: "0 0 6px rgba(34,197,94,0.55)",
            }}
          />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-zinc-100 leading-none">
            {headerTitle}
          </p>
          <p className="text-[11px] text-teal-500/70 mt-0.5 leading-none">
            Online
          </p>
        </div>
      </div>

      {/* ── Messages area ── */}
      <div
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 relative"
        style={{ scrollbarWidth: "thin" }}
      >
        {isPending && (
          <div className="space-y-4 pt-2">
            <SkeletonBubble />
            <SkeletonBubble right />
            <SkeletonBubble />
            <SkeletonBubble right />
            <SkeletonBubble />
          </div>
        )}

        {!isPending && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div
              className="size-12 rounded-2xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(20,184,166,0.08), rgba(6,182,212,0.04))",
                border: "1px solid rgba(20,184,166,0.15)",
              }}
            >
              <MessageCircleDashed
                className="size-6 text-teal-600"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-zinc-400">
                No messages yet
              </p>
              <p className="text-[11.5px] text-zinc-600 mt-0.5">
                Send a message to start the conversation
              </p>
            </div>
          </div>
        )}

        {!isPending &&
          messages.map((msg, i) => {
            const prev = messages[i - 1];
            const showDivider =
              !prev || !isSameDay(prev.createdAt, msg.createdAt);
            const isMine = msg.senderId === currentUserId;
            const isConsecutive =
              !showDivider &&
              prev?.senderId === msg.senderId &&
              new Date(msg.createdAt).getTime() -
                new Date(prev.createdAt).getTime() <
                5 * 60 * 1000;
            const showAvatar = !isConsecutive;

            return (
              <React.Fragment key={msg.id}>
                {showDivider && (
                  <div className="flex items-center gap-3 my-4">
                    <div
                      className="flex-1 h-px"
                      style={{ background: "rgba(20,184,166,0.1)" }}
                    />
                    <span className="text-[10px] font-semibold text-zinc-600 px-2">
                      {formatDateDivider(msg.createdAt)}
                    </span>
                    <div
                      className="flex-1 h-px"
                      style={{ background: "rgba(20,184,166,0.1)" }}
                    />
                  </div>
                )}
                <MessageBubble
                  message={msg}
                  isMine={isMine}
                  showAvatar={showAvatar}
                  isConsecutive={isConsecutive}
                />
              </React.Fragment>
            );
          })}

        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom FAB */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-6 flex items-center justify-center size-8 rounded-full transition-all duration-200 hover:scale-110"
          style={{
            background:
              "linear-gradient(135deg, rgba(20,184,166,0.25), rgba(6,182,212,0.2))",
            border: "1px solid rgba(20,184,166,0.35)",
            boxShadow: "0 4px 16px rgba(20,184,166,0.15)",
          }}
        >
          <ArrowDown className="size-3.5 text-teal-300" strokeWidth={2.5} />
        </button>
      )}

      {/* ── Input bar ── */}
      <div
        className="shrink-0 px-3 py-3 border-t border-teal-950/50"
        style={{
          background: "rgba(10,10,15,0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          className="flex items-end gap-2 px-3 py-2 rounded-xl border transition-colors duration-200 focus-within:border-teal-500/40"
          style={{
            background: "rgba(20,184,166,0.04)",
            borderColor: "rgba(20,184,166,0.12)",
          }}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            className="flex-1 bg-transparent text-[13px] text-zinc-200 placeholder:text-zinc-600 outline-none resize-none leading-relaxed max-h-[120px] py-1"
            style={{ scrollbarWidth: "none" }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className={cn(
              "flex items-center justify-center size-8 rounded-lg shrink-0 transition-all duration-200 mb-0.5",
              text.trim() && !sending
                ? "hover:scale-105 cursor-pointer"
                : "opacity-40 cursor-not-allowed",
            )}
            style={{
              background:
                text.trim() && !sending
                  ? "linear-gradient(135deg, #0f766e, #0d9488)"
                  : "rgba(255,255,255,0.05)",
              boxShadow:
                text.trim() && !sending
                  ? "0 0 12px rgba(20,184,166,0.35)"
                  : "none",
            }}
          >
            {sending ? (
              <Loader2
                className="size-3.5 text-teal-100 animate-spin"
                strokeWidth={2}
              />
            ) : (
              <Send className="size-3.5 text-teal-100" strokeWidth={2} />
            )}
          </button>
        </div>
        <p className="text-[10px] text-zinc-700 mt-1.5 px-1">
          Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
