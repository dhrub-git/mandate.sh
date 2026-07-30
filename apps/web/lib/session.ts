import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { db } from "@repo/database";

const COOKIE_NAME = "mandate_uid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export type SessionUser = {
  id: string;
  email: string;
  companyId: string | null;
  onboarded: boolean;
};

/**
 * Cookie-backed anonymous session user (auth-lite).
 * Real IdP (Clerk/Auth.js) can replace this later while keeping companyId linkage.
 */
export async function getOrCreateSessionUser(): Promise<SessionUser> {
  const jar = await cookies();
  const existingId = jar.get(COOKIE_NAME)?.value;

  if (existingId) {
    const user = await db.user.findUnique({ where: { id: existingId } });
    if (user) {
      return {
        id: user.id,
        email: user.email,
        companyId: user.companyId,
        onboarded: user.onboarded,
      };
    }
  }

  const user = await db.user.create({
    data: {
      email: `anon-${randomUUID()}@session.mandate.local`,
      name: "Anonymous session",
    },
  });

  jar.set(COOKIE_NAME, user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return {
    id: user.id,
    email: user.email,
    companyId: user.companyId,
    onboarded: user.onboarded,
  };
}

export async function linkUserToCompany(
  userId: string,
  companyId: string,
): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { companyId, onboarded: true },
  });
}

export async function recordOwnedThread(
  companyId: string,
  threadId: string,
): Promise<void> {
  const company = await db.company.findUnique({ where: { id: companyId } });
  if (!company) return;

  const info = (company.additionalInfo as Record<string, unknown> | null) ?? {};
  const owned = Array.isArray(info.ownedThreadIds)
    ? (info.ownedThreadIds as string[])
    : [];
  if (!owned.includes(threadId)) {
    owned.push(threadId);
  }

  await db.company.update({
    where: { id: companyId },
    data: {
      additionalInfo: {
        ...info,
        ownedThreadIds: owned,
        activeThreadId: threadId,
      },
    },
  });
}

/**
 * Returns true if the session user owns the company that owns this thread
 * (via Policy rows or company.additionalInfo.ownedThreadIds).
 */
export async function sessionOwnsThread(
  user: SessionUser,
  threadId: string,
): Promise<boolean> {
  if (!user.companyId) return false;

  const policy = await db.policy.findFirst({
    where: { threadId, companyId: user.companyId },
    select: { id: true },
  });
  if (policy) return true;

  const company = await db.company.findUnique({
    where: { id: user.companyId },
    select: { additionalInfo: true },
  });
  const info = (company?.additionalInfo as Record<string, unknown> | null) ?? {};
  const owned = Array.isArray(info.ownedThreadIds)
    ? (info.ownedThreadIds as string[])
    : [];
  return owned.includes(threadId) || info.activeThreadId === threadId;
}
