"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, CheckCheck, Circle } from "lucide-react";
import {
  getSessionNotifications,
  markSessionNotificationRead,
  markSessionNotificationsRead,
} from "@/actions/notifications";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  threadId: string | null;
  policyId: string | null;
  readAt: string | null;
  createdAt: string;
  metadata: unknown;
};

const TYPE_ACCENT: Record<string, string> = {
  POLICY_CREATED: "bg-emerald-500",
  POLICY_STATUS_CHANGED: "bg-blue-500",
  POLICY_REFINED: "bg-violet-500",
  WORKFLOW_COMPLETED: "bg-amber-500",
  SYSTEM: "bg-gray-400",
};

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationCenter({
  threadId,
}: {
  threadId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pending, startTransition] = useTransition();

  const refresh = () => {
    startTransition(async () => {
      const result = await getSessionNotifications(threadId);
      setItems(result.notifications);
      setUnreadCount(result.unreadCount);
    });
  };

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 20_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  const handleMarkOne = (id: string) => {
    startTransition(async () => {
      await markSessionNotificationRead(id);
      refresh();
    });
  };

  const handleMarkAll = () => {
    startTransition(async () => {
      await markSessionNotificationsRead(threadId);
      refresh();
    });
  };

  return (
    <div className="relative print:hidden">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) refresh();
        }}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-300 dark:hover:bg-zinc-800"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900 sm:w-96">
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5 dark:border-zinc-800">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Notifications
                </p>
                <p className="text-[11px] text-gray-500">
                  Policy lifecycle updates
                  {pending ? " · refreshing" : ""}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500">
                  No notifications yet. Status changes and policy events will
                  appear here.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {items.map((item) => {
                    const unread = !item.readAt;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => unread && handleMarkOne(item.id)}
                          className={`flex w-full gap-3 px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-800/60 ${
                            unread ? "bg-emerald-50/40 dark:bg-emerald-950/20" : ""
                          }`}
                        >
                          <span
                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                              TYPE_ACCENT[item.type] ?? TYPE_ACCENT.SYSTEM
                            }`}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                {item.title}
                              </span>
                              <span className="shrink-0 text-[10px] text-gray-400">
                                {formatRelative(item.createdAt)}
                              </span>
                            </span>
                            <span className="mt-0.5 block text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">
                              {item.body}
                            </span>
                            {unread && (
                              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                                <Circle className="h-2 w-2 fill-current" />
                                Unread
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
