import { ChatMessageAI } from "@/utils/types";
import { generateText, Output, tool,  UIMessageStreamWriter } from "ai";
import z from "zod";
import { aiGovernancePolicySpec } from "@repo/agents";
import { google } from "@ai-sdk/google";
import { updatePolicyContent } from "@repo/database";
import { PolicyUpdateProps } from "@/context/chat/PolicyAgentContext";

const sectionIds = z
    .enum([
        "1. Purpose & Scope",
        "2. Applicable Regulations",
        "3. AI System Inventory Summary",
        "4. Governance Structure",
        "5. Roles & Responsibilities",
        "6. Risk Appetite Statement",
        "7. Policy Review Schedule",
        "8. Document Control",
    ])
    .describe(
        "The ID of the policy section that is being drafted, which will guide how the information should be rewritten.",
    );
export const findSectionContextTool = tool({
    description: `
        Retrieve the official specification and drafting guidance for a given policy section.

        Use this tool when:
        - You need clarity on what a section should contain
        - You need structure, intent, or constraints for rewriting

        Returns:
        - Section description
        - Expected content
        - Structural guidance

        Do NOT use this tool if you already clearly understand the section requirements.
        `,
    inputSchema: z.object({
        sectionId: sectionIds,
    }),
    execute: async ({ sectionId }) => {
        try {
            const sectionSpec = aiGovernancePolicySpec.sections[sectionId];

            return sectionSpec;
        } catch (error) {
            console.error("Error in findSectionContextTool:", error);
            throw new Error("Failed to find relevant context for the policy section.");
        }
    },
});

const generateRewritePrompt = (
    originalSection: string,
    companyInfo: string,
    updateRequirement: string,
    generationSpecifics: string,
    sectionId: string,
): string => {
    return `
You are an expert policy writer and compliance specialist.

Your task is to update a policy section based on new requirements.

---

## 📌 Section
${sectionId}

---

## 🏢 Company Context
${companyInfo || "Not provided"}

---

## 🔧 Update Requirement
${updateRequirement}

---

## ✍️ Style Guidelines
${generationSpecifics || "Formal, precise, and policy-compliant language"}

---

## 📄 Existing Content
"""
${originalSection || "No existing content"}
"""

---

## 🎯 Instructions

1. Rewrite or refine the section to incorporate the update requirement
2. Ensure alignment with formal policy standards
3. Avoid redundancy and vague language
4. Maintain clarity and structure

---

## 📦 Output Format (STRICT JSON)

Return ONLY a JSON object:

{
  "text": "<final rewritten markdown section starting with ### ${sectionId}>",
  "changeNotes": "<clear explanation of what changed and why>"
}

---

## 🚫 Do NOT:
- Include explanations outside JSON
- Include extra keys
- Include markdown outside the "text" field

---

Generate the output now.
`;
};

export const rewriteForSectionTool = (
    dataStream: UIMessageStreamWriter<ChatMessageAI>,
    threadId: string,
    version: number | null,
) =>
    tool({
        description: `
            Rewrite and update policy content for a specific section based on user intent.

            This tool:
            - Adapts user-provided updates into formal policy language
            - Aligns content with section-specific requirements
            - Persists the updated content to the database
            - Streams updates to the UI

            Use this tool whenever:
            - The user provides new information
            - The user requests a modification to an existing section
            - A section needs to be updated or refined

            Input must include:
            - Original or current content
            - Company context
            - Clear update intent
            - Target section

            Returns:
            - Rewritten policy content (stored automatically)
            - Change notes for audit tracking

            IMPORTANT:
            - This tool performs the actual update — do NOT rewrite content outside the tool
            `,
        inputSchema: z.object({
            originalSection: z
                .string()
                .describe(
                    "The original piece of information that needs to be rewritten for relevance.",
                ),
            companyInfo: z
                .string()
                .describe(
                    "General information about the company that might be relevant for rewriting the information.",
                ),
            updateRequirement: z
                .string()
                .describe(
                    "Specific requirements or focus areas for the policy section that should be emphasized in the rewritten information.",
                ),
            generationSpecifics: z
                .string()
                .describe(
                    "Any specifics about the generation style or tone that should be used in the rewritten information.",
                ),
            sectionId: sectionIds,
        }),
        execute: async ({
            originalSection,
            companyInfo,
            updateRequirement,
            generationSpecifics,
            sectionId,
        }) => {
            try {
                const prompt = generateRewritePrompt(
                    originalSection,
                    companyInfo,
                    updateRequirement,
                    generationSpecifics,
                    sectionId,
                );

                const rewrittenInfo = await generateText({
                    model: google("gemini-2.5-flash"),
                    prompt,
                    output: Output.object({
                        schema: z.object({
                            text: z.string().describe("The rewritten content relevant to the policy section."),
                            changeNotes: z.string().describe("Notes on what was changed and why, for audit purposes."),
                        })
                    })
                });

                const updatedPolicy = await updatePolicyContent(threadId, rewrittenInfo.output.text, sectionId, rewrittenInfo.output.changeNotes, version);

                dataStream.write({
                    id: `rewrite-${sectionId}-${Date.now()}`,
                    type: "data-update-section",
                    data: {
                        updatedPolicy,
                        sectionId: sectionId,
                        rewrittenInfo: rewrittenInfo.output.text,
                        changeNotes: rewrittenInfo.output.changeNotes,
                        version: updatedPolicy.version,
                    } satisfies PolicyUpdateProps,
                });

                return rewrittenInfo.output;
            } catch (error) {
                console.error("Error in rewriteForSectionTool:", error);
                throw new Error("Failed to rewrite content for the policy section.");
            }
        },
    });
