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

/**
 * Updates an existing policy with a new status and optional change note
 * @param policyId 
 * @param status 
 * @param changeNote 
 * @returns The updated policy
 */
export async function updatePolicy(
    policyId: string,
    status: PolicyStatus,
    changeNote?: string
) {
    const policy = await db.policy.update({
        where: {
            id: policyId,
        },
        data: {
            status,
            ...(changeNote && changeNote.length > 0
                ? { changeNote }
                : {}),
        },
    });

    return policy;
}

type PolicySection = {
    title: string;
    content: string;
};

export async function updatePolicyContent(
    threadId: string,
    updatedSectionContent: string,
    sectionId: string,
    changeNote: string,
    version: number | null,
) {
    // 1. Get latest policy
    const latestPolicy = await db.policy.findFirst({
        where: {
            threadId,
            ...(version ? { version } : {}) // If version is provided, filter by it
        },
        orderBy: { createdAt: "desc" },
    });
    const currentVersion = await db.policy.count({
        where: {
            threadId,
        },
    });

    if (!latestPolicy) {
        throw new Error("No existing policy found for this thread");
    }

    // 2. Parse sections safely
    const sections = (latestPolicy.sections || []) as PolicySection[];

    if (!Array.isArray(sections)) {
        throw new Error("Invalid sections format in policy");
    }

    // 3. Update the specific section
    let sectionFound = false;

    const updatedSections = sections.map((section) => {
        if (section.title === sectionId) {
            sectionFound = true;
            return {
                ...section,
                content: updatedSectionContent,
            };
        }
        return section;
    });

    // Optional: if section doesn't exist, add it
    if (!sectionFound) {
        updatedSections.push({
            title: sectionId,
            content: updatedSectionContent,
        });
    }

    // 4. Rebuild full markdown content
    const rebuiltContent = await updateMarkdownSectionAST(
        latestPolicy.content,
        sectionId,
        updatedSectionContent
    );

    // 5. Create new version
    const updatedPolicy = await db.policy.create({
        data: {
            companyId: latestPolicy.companyId,
            threadId: latestPolicy.threadId,
            content: rebuiltContent,
            sections: updatedSections,
            version: currentVersion + 1,
            changeNote,
            status: latestPolicy.status,
        },
    });

    return updatedPolicy;
}