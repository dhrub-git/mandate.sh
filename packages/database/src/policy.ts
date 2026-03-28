import { version } from "os";
import { db } from ".";
import { PolicyStatus } from "@prisma/client";
import { updateMarkdownSectionAST } from "./utils/updateMarkdown";

/**
 * Creates a new policy
 * @param companyId 
 * @param threadId 
 * @param content 
 * @param sections 
 * @returns The created policy
 */
export async function createPolicy(companyId: string, threadId: string, content: string, sections: any) {
    const policy = await db.policy.create({
        data: {
            companyId,
            threadId,
            content,
            sections,
            version: 1,
        }
    });
    return policy;
}

/**
 * Retrieves the latest policy for a given thread, along with its version history
 * @param threadId 
 * @returns The current policy and its previous versions
 */
export async function getPoliciesByCompany(threadId: string) {
    const policies = await db.policy.findMany({
        where: {
            threadId,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    if (policies.length === 0) {
        return {
            current: null,
            versions: [],
        }
    }
    // Get the latest version of policy in the thread
    const latestPolicy = policies[0]!;
    return {
        current: latestPolicy,
        versions: policies.slice(1), // All previous versions
    };
}

const VALID_TRANSITIONS: Record<PolicyStatus, PolicyStatus[]> = {
  DRAFT:      ["IN_REVIEW"],
  IN_REVIEW:  ["APPROVED", "REJECTED"],
  REJECTED:   ["DRAFT"],
  APPROVED:   ["PUBLISHED"],
  PUBLISHED:  [],
};

function validateTransition(from: PolicyStatus, to: PolicyStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}


/**
 * Updates an existing policy with a new status and change note
 * @param policyId 
 * @param status 
 * @param changeNote 
 * @returns The updated policy
 */
export async function updatePolicy(
    policyId: string,
    status: PolicyStatus,
    changeNote: string
) {
    const existingPolicy = await db.policy.findUniqueOrThrow({
        where: {
            id: policyId,
        },
    });
    const currentVersionNumber = await db.policy.count({
        where: {
            threadId: existingPolicy.threadId,
        }
    })
    if(!validateTransition(existingPolicy.status, status)) {
        throw new Error(`Invalid status transition from ${existingPolicy.status} to ${status}`);
    }
    const policy = await db.policy.create({
        data: {
            companyId: existingPolicy.companyId,
            threadId: existingPolicy.threadId,
            content: existingPolicy.content,
            sections: existingPolicy.sections as PolicySection[],
            status,
            changeNote,
            version: currentVersionNumber + 1,
            parentId: existingPolicy.id,

        }
    })

    return policy;
}

type PolicySection = {
    title: string;
    content: string;
};

function parseSections(policyText?: string | null): { title: string; content: string }[] {
  if (!policyText || typeof policyText !== "string") return [];

  const sectionRegex = /^##\s+(.+?)\n([\s\S]*?)(?=^##\s+|\Z)/gm;

  const sections: { title: string; content: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = sectionRegex.exec(policyText)) !== null) {
    const rawTitle = match[1]?.trim();
    const content = match[2]?.trim() ?? "";

    if (!rawTitle) continue;

    // Optional: clean numbering like "1. Introduction" → "Introduction"
    const title = rawTitle.replace(/^\d+[\.\)]\s*/, "").trim();

    sections.push({ title, content });
  }

  return sections;
}

export async function updatePolicyContent(
    threadId: string,
    updatedContent: string,
    changeNote: string,
    version: number | null,
) {
    // 1. Get latest policy
    const [latestPolicy, currentVersion] = await Promise.all([
        db.policy.findFirst({
            where: {
                threadId,
                ...(version ? { version } : {})
            },
            orderBy: { createdAt: "desc" },
        }),
        db.policy.count({
            where: {
                threadId,
            },
        }),
    ]);

    if (!latestPolicy) {
        throw new Error("No existing policy found for this thread");
    }

    const updatedSections = parseSections(updatedContent);
    

    // 5. Create new version
    const updatedPolicy = await db.policy.create({
        data: {
            companyId: latestPolicy.companyId,
            threadId: latestPolicy.threadId,
            content: updatedContent,
            sections: updatedSections,
            version: currentVersion + 1,
            changeNote,
            status: latestPolicy.status,
            parentId: latestPolicy.id,
        },
    });

    return updatedPolicy;
}