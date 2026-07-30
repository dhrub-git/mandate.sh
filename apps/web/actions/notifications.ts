"use server";

import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  countUnreadNotifications,
} from "@repo/database";
import { getOrCreateSessionUser } from "@/lib/session";

export async function getSessionNotifications(threadId?: string) {
  const user = await getOrCreateSessionUser();
  if (!user.companyId) {
    return { notifications: [], unreadCount: 0 };
  }

  const [notifications, unreadCount] = await Promise.all([
    listNotifications({
      companyId: user.companyId,
      userId: user.id,
      threadId,
      limit: 40,
    }),
    countUnreadNotifications({
      companyId: user.companyId,
      userId: user.id,
      threadId,
    }),
  ]);

  return {
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      threadId: n.threadId,
      policyId: n.policyId,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
      metadata: n.metadata,
    })),
    unreadCount,
  };
}

export async function markSessionNotificationRead(notificationId: string) {
  const user = await getOrCreateSessionUser();
  if (!user.companyId) {
    throw new Error("No company linked to session");
  }
  await markNotificationRead(notificationId);
  return { ok: true };
}

export async function markSessionNotificationsRead(threadId?: string) {
  const user = await getOrCreateSessionUser();
  if (!user.companyId) {
    throw new Error("No company linked to session");
  }
  await markAllNotificationsRead({
    companyId: user.companyId,
    userId: user.id,
    threadId,
  });
  return { ok: true };
}
