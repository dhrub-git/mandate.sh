import { db } from ".";
import type { NotificationType, PolicyStatus, Prisma } from "@prisma/client";

export type NotifyInput = {
  companyId: string;
  userId?: string | null;
  threadId?: string | null;
  policyId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Prisma.InputJsonValue;
};

async function deliverWebhook(payload: Record<string, unknown>): Promise<void> {
  const url = process.env.NOTIFICATION_WEBHOOK_URL;
  if (!url) return;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.NOTIFICATION_WEBHOOK_SECRET
          ? { Authorization: `Bearer ${process.env.NOTIFICATION_WEBHOOK_SECRET}` }
          : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.warn(
        `Notification webhook failed: ${res.status} ${await res.text()}`,
      );
    }
  } catch (err) {
    console.warn("Notification webhook error:", err);
  }
}

/**
 * Persist an in-app notification and optionally POST to NOTIFICATION_WEBHOOK_URL.
 */
export async function notify(input: NotifyInput) {
  const notification = await db.notification.create({
    data: {
      companyId: input.companyId,
      userId: input.userId ?? null,
      threadId: input.threadId ?? null,
      policyId: input.policyId ?? null,
      type: input.type,
      title: input.title,
      body: input.body,
      metadata: input.metadata ?? undefined,
    },
  });

  // Fan out to company users when no specific user is set
  void deliverWebhook({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    companyId: notification.companyId,
    userId: notification.userId,
    threadId: notification.threadId,
    policyId: notification.policyId,
    metadata: notification.metadata,
    createdAt: notification.createdAt.toISOString(),
  });

  return notification;
}

export async function notifyPolicyCreated(args: {
  companyId: string;
  threadId: string;
  policyId: string;
  version: number;
}) {
  return notify({
    companyId: args.companyId,
    threadId: args.threadId,
    policyId: args.policyId,
    type: "POLICY_CREATED",
    title: "AI governance policy ready",
    body: `Version ${args.version} was generated and saved as Draft. Review it in the dashboard, then submit for review when ready.`,
    metadata: { version: args.version },
  });
}

export async function notifyPolicyStatusChanged(args: {
  companyId: string;
  threadId: string;
  policyId: string;
  from: PolicyStatus;
  to: PolicyStatus;
  version: number;
  changeNote: string;
}) {
  const labels: Record<PolicyStatus, string> = {
    DRAFT: "Draft",
    IN_REVIEW: "In Review",
    APPROVED: "Approved",
    PUBLISHED: "Published",
    REJECTED: "Rejected",
  };

  return notify({
    companyId: args.companyId,
    threadId: args.threadId,
    policyId: args.policyId,
    type: "POLICY_STATUS_CHANGED",
    title: `Policy moved to ${labels[args.to]}`,
    body: `Status changed from ${labels[args.from]} → ${labels[args.to]} (v${args.version}). Note: ${args.changeNote}`,
    metadata: {
      from: args.from,
      to: args.to,
      version: args.version,
      changeNote: args.changeNote,
    },
  });
}

export async function notifyPolicyRefined(args: {
  companyId: string;
  threadId: string;
  policyId: string;
  version: number;
  changeNote: string;
}) {
  return notify({
    companyId: args.companyId,
    threadId: args.threadId,
    policyId: args.policyId,
    type: "POLICY_REFINED",
    title: "Policy refined by AI",
    body: `A new draft version (v${args.version}) was created. ${args.changeNote}`,
    metadata: { version: args.version, changeNote: args.changeNote },
  });
}

export async function listNotifications(args: {
  companyId: string;
  userId?: string | null;
  threadId?: string | null;
  unreadOnly?: boolean;
  limit?: number;
}) {
  return db.notification.findMany({
    where: {
      companyId: args.companyId,
      ...(args.threadId ? { threadId: args.threadId } : {}),
      ...(args.unreadOnly ? { readAt: null } : {}),
      OR: [
        { userId: null },
        ...(args.userId ? [{ userId: args.userId }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    take: args.limit ?? 30,
  });
}

export async function markNotificationRead(notificationId: string) {
  return db.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(args: {
  companyId: string;
  userId?: string | null;
  threadId?: string | null;
}) {
  return db.notification.updateMany({
    where: {
      companyId: args.companyId,
      readAt: null,
      ...(args.threadId ? { threadId: args.threadId } : {}),
      OR: [
        { userId: null },
        ...(args.userId ? [{ userId: args.userId }] : []),
      ],
    },
    data: { readAt: new Date() },
  });
}

export async function countUnreadNotifications(args: {
  companyId: string;
  userId?: string | null;
  threadId?: string | null;
}) {
  return db.notification.count({
    where: {
      companyId: args.companyId,
      readAt: null,
      ...(args.threadId ? { threadId: args.threadId } : {}),
      OR: [
        { userId: null },
        ...(args.userId ? [{ userId: args.userId }] : []),
      ],
    },
  });
}
