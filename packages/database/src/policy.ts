import { db } from ".";
import { PolicyStatus } from "@prisma/client";
import { parseSections } from "./parseSections";
import {
  notifyPolicyCreated,
  notifyPolicyRefined,
  notifyPolicyStatusChanged,
} from "./notifications";

/**
 * Creates a new policy
 */
export async function createPolicy(
  companyId: string,
  threadId: string,
  content: string,
  sections: any,
) {
  const policy = await db.policy.create({
    data: {
      companyId,
      threadId,
      content,
      sections,
      version: 1,
    },
  });

  try {
    await notifyPolicyCreated({
      companyId,
      threadId,
      policyId: policy.id,
      version: policy.version,
    });
  } catch (err) {
    console.warn("Failed to emit POLICY_CREATED notification:", err);
  }

  return policy;
}

/**
 * Retrieves the latest policy for a given thread, along with its version history
 */
export async function getPoliciesByCompany(threadId: string) {
  const policies = await db.policy.findMany({
    where: {
      threadId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (policies.length === 0) {
    return {
      current: null,
      versions: [],
    };
  }
  const latestPolicy = policies[0]!;
  return {
    current: latestPolicy,
    versions: policies.slice(1),
  };
}

const VALID_TRANSITIONS: Record<PolicyStatus, PolicyStatus[]> = {
  DRAFT: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "REJECTED"],
  REJECTED: ["DRAFT"],
  APPROVED: ["PUBLISHED"],
  PUBLISHED: [],
};

function validateTransition(from: PolicyStatus, to: PolicyStatus): boolean {
  return (VALID_TRANSITIONS[from] ?? []).includes(to);
}

/**
 * Updates an existing policy with a new status and change note
 */
export async function updatePolicy(
  policyId: string,
  status: PolicyStatus,
  changeNote: string,
) {
  const policy = await db.$transaction(async (tx) => {
    const existingPolicy = await tx.policy.findUniqueOrThrow({
      where: { id: policyId },
    });

    if (!validateTransition(existingPolicy.status, status)) {
      throw new Error(
        `Invalid status transition from ${existingPolicy.status} to ${status}`,
      );
    }

    const versionAgg = await tx.policy.aggregate({
      where: {
        threadId: existingPolicy.threadId,
      },
      _max: { version: true },
    });
    const nextVersion = (versionAgg._max.version ?? 0) + 1;

    return tx.policy.create({
      data: {
        companyId: existingPolicy.companyId,
        threadId: existingPolicy.threadId,
        content: existingPolicy.content,
        sections: existingPolicy.sections as PolicySection[],
        status,
        changeNote,
        version: nextVersion,
        parentId: existingPolicy.id,
      },
    });
  });

  try {
    const previous = await db.policy.findUnique({
      where: { id: policy.parentId! },
      select: { status: true },
    });
    await notifyPolicyStatusChanged({
      companyId: policy.companyId,
      threadId: policy.threadId,
      policyId: policy.id,
      from: previous?.status ?? "DRAFT",
      to: policy.status,
      version: policy.version,
      changeNote: changeNote,
    });
  } catch (err) {
    console.warn("Failed to emit POLICY_STATUS_CHANGED notification:", err);
  }

  return policy;
}

type PolicySection = {
  title: string;
  content: string;
};

export async function updatePolicyContent(
  threadId: string,
  updatedContent: string,
  changeNote: string,
  version: number | null,
) {
  const updatedPolicy = await db.$transaction(async (tx) => {
    const latestPolicy = await tx.policy.findFirst({
      where: {
        threadId,
        ...(version ? { version } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    if (!latestPolicy) {
      throw new Error("No existing policy found for this thread");
    }

    const versionAgg = await tx.policy.aggregate({
      where: { threadId },
      _max: { version: true },
    });
    const nextVersion = (versionAgg._max.version ?? 0) + 1;

    const updatedSections = parseSections(updatedContent);

    return tx.policy.create({
      data: {
        companyId: latestPolicy.companyId,
        threadId: latestPolicy.threadId,
        content: updatedContent,
        sections: updatedSections,
        version: nextVersion,
        changeNote,
        status: latestPolicy.status,
        parentId: latestPolicy.id,
      },
    });
  });

  try {
    await notifyPolicyRefined({
      companyId: updatedPolicy.companyId,
      threadId: updatedPolicy.threadId,
      policyId: updatedPolicy.id,
      version: updatedPolicy.version,
      changeNote,
    });
  } catch (err) {
    console.warn("Failed to emit POLICY_REFINED notification:", err);
  }

  return updatedPolicy;
}
