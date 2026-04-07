"use client";

import { useFetchNotifications } from "@/hooks/notifications/useFetchNotifications";
import { useDeleteNotification } from "@/hooks/notifications/useDeleteNotification";
import { useReadNotification } from "@/hooks/notifications/useReadNotification";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { Notification } from "@/types/notification";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Info,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 5;

/* 
   Helpers
 */
function getTypeConfig(type: string) {
  const t = type?.toLowerCase();
  if (t === "invite" || t === "team")
    return {
      icon: <Users className="w-4 h-4" />,
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
      badge: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
    };
  if (t === "warning" || t === "alert")
    return {
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      badge: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    };
  if (t === "success" || t === "completed")
    return {
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    };
  if (t === "message" || t === "comment")
    return {
      icon: <MessageSquare className="w-4 h-4" />,
      color: "text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20",
      badge: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
    };
  if (t === "system" || t === "update")
    return {
      icon: <Zap className="w-4 h-4" />,
      color: "text-pink-400",
      bg: "bg-pink-500/10 border-pink-500/20",
      badge: "bg-pink-500/20 text-pink-300 border border-pink-500/30",
    };
  return {
    icon: <Info className="w-4 h-4" />,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    badge: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  };
}

/* 
   Single Row
 */
function NotificationRow({
  notification,
  orgId,
}: {
  notification: Notification;
  orgId: number | undefined;
}) {
  const { mutate: markRead, isPending: isReading } = useReadNotification(
    orgId,
    notification.id,
  );
  const { mutate: deleteNotif, isPending: isDeleting } = useDeleteNotification(
    notification.id,
    orgId,
  );

  const cfg = getTypeConfig(notification.type);

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 rounded-xl border px-4 py-3.5 transition-all duration-200",
        "hover:scale-[1.005] hover:shadow-lg hover:shadow-black/20",
        notification.isRead
          ? "bg-white/5 border-white/10 text-white/50 shadow-sm shadow-white/5"
          : cn("border", cfg.bg),
      )}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_6px_2px_rgba(96,165,250,0.5)]" />
      )}

      {/* Icon bubble */}
      <div
        className={cn(
          "mt-0.5 shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border",
          notification.isRead
            ? "bg-white/10 border-white/15 text-white/40"
            : cn(cfg.color, "bg-white/5 border-white/10"),
        )}
      >
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span
            className={cn(
              "text-xs font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md",
              notification.isRead
                ? "bg-white/10 text-white/50 border border-white/10"
                : cfg.badge,
            )}
          >
            {notification.type}
          </span>
          {notification.user?.name && (
            <span className="text-xs text-white/30">
              from{" "}
              <span className="text-white/50 font-medium">
                {notification.user.name}
              </span>
            </span>
          )}
        </div>
        <p
          className={cn(
            "text-sm leading-relaxed line-clamp-2",
            notification.isRead ? "text-white/50" : "text-white/80",
          )}
        >
          {notification.message}
        </p>
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-2 mt-0.5">
        {!notification.isRead && (
          <button
            onClick={() => markRead()}
            disabled={isReading}
            title="Mark as read"
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150",
              "text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10",
              "border border-transparent hover:border-emerald-500/20",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            )}
          >
            {isReading ? (
              <span className="w-3.5 h-3.5 border-2 border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin" />
            ) : (
              <CheckCheck className="w-3.5 h-3.5" />
            )}
          </button>
        )}
        <button
          onClick={() => deleteNotif()}
          disabled={isDeleting}
          title="Delete notification"
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150",
            "text-white/40 hover:text-red-400 hover:bg-red-500/10",
            "border border-transparent hover:border-red-500/20",
            "disabled:opacity-40 disabled:cursor-not-allowed",
          )}
        >
          {isDeleting ? (
            <span className="w-3.5 h-3.5 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

/* 
   Skeleton loader
 */
function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/2 px-4 py-3.5 animate-pulse">
      <div className="w-9 h-9 rounded-lg bg-white/5 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-20 rounded-full bg-white/5" />
        <div className="h-3.5 w-3/4 rounded-full bg-white/5" />
        <div className="h-3.5 w-1/2 rounded-full bg-white/5" />
      </div>
    </div>
  );
}

/* 
   Pagination
 */
function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  const rendered: (number | "...")[] = [];
  visiblePages.forEach((p, i) => {
    if (i > 0 && p - visiblePages[i - 1] > 1) rendered.push("...");
    rendered.push(p);
  });

  return (
    <div className="flex items-center justify-center gap-1.5 pt-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150",
          "border border-white/10 text-white/40",
          "hover:border-white/20 hover:text-white/70 hover:bg-white/5",
          "disabled:opacity-30 disabled:cursor-not-allowed",
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {rendered.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="text-white/20 text-sm px-1">
            ···
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              "w-8 h-8 rounded-lg text-sm font-medium transition-all duration-150",
              "border",
              page === p
                ? "bg-white/10 border-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                : "border-white/5 text-white/40 hover:border-white/15 hover:text-white/70 hover:bg-white/5",
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150",
          "border border-white/10 text-white/40",
          "hover:border-white/20 hover:text-white/70 hover:bg-white/5",
          "disabled:opacity-30 disabled:cursor-not-allowed",
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* 
   Main Component
 */
const Notifications = () => {
  const { slug } = useParams();
  const { data: org } = useOrganization(slug as string);
  const orgId = org?.id ? Number(org.id) : undefined;

  const [page, setPage] = useState(1);

  const { data: notifications, isPending } = useFetchNotifications(
    orgId,
    page,
    ITEMS_PER_PAGE,
  );

  const total = notifications?.total ?? 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const unreadCount = notifications?.data.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="relative min-h-full p-6">
      <div className="max-w-2xl ml-0 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white/70" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-1 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.6)]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white/90 leading-tight">
                Notifications
              </h1>
              <p className="text-xs text-white/30">
                {total > 0 ? ` ${unreadCount} unread` : "All caught up"}
              </p>
            </div>
          </div>

          {/* Page info */}
          {totalPages > 1 && (
            <span className="text-xs text-white/25 font-mono">
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-linear-to-r from-transparent via-white/8 to-transparent" />

        {/* List */}
        <div className="space-y-2">
          {isPending ? (
            Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <NotificationSkeleton key={i} />
            ))
          ) : notifications?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/3 border border-white/8 flex items-center justify-center">
                <BellOff className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-sm text-white/25 font-medium">
                No notifications yet
              </p>
              <p className="text-xs text-white/15">
                You&apos;re all caught up!
              </p>
            </div>
          ) : (
            notifications?.data.map((n) => (
              <NotificationRow key={n.id} notification={n} orgId={orgId} />
            ))
          )}
        </div>

        {/* Pagination */}
        {!isPending && totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default Notifications;
