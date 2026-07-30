import { ChatMessageAI } from "@/utils/types";
import { generateText, Output, tool, UIMessageStreamWriter } from "ai";
import z from "zod";
import { aiGovernancePolicySpec } from "@repo/agents";
import { openai } from '@ai-sdk/openai';
import { updatePolicyContent } from "@repo/database";
import { PolicyUpdateProps } from "@/context/chat/PolicyAgentContext";
import { findSectionContextPrompt, generateRewritePrompt, rewritePolicySectionPrompt } from "../prompts/policy";

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

const method = z.enum(["DET", "LLM", "HYB", "STO + DET"]).describe(
    "The method by which the section content should be generated or updated, which can influence the style and approach to rewriting the information.",
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
        sectionId: sectionIds.optional(),
        sectionHeading: z.string().optional().describe("The heading or title of the policy section, which can be used to infer the section ID if the ID is not provided."),
        sectionContent: z.string().optional().describe("The current content of the section, which can provide additional context for determining the section requirements."),
        updateRequirement: z.string().optional().describe("Any specific requirements or focus areas for the section that should be emphasized in the guidance."),
    }),
    execute: async ({ sectionId, sectionHeading, sectionContent, updateRequirement }) => {
        try {
            if (sectionId) {
                const sectionSpec = aiGovernancePolicySpec.sections[sectionId];
                return sectionSpec;
            }
            else {
                if (!sectionHeading || !sectionContent || !updateRequirement) {
                    throw new Error("Insufficient information to determine section context. Please provide either a sectionId or a combination of sectionHeading, sectionContent, and updateRequirement.");
                }
                const { output } = await generateText({
                    model: openai("gpt-5"),
                    prompt: findSectionContextPrompt({
                        sectionHeading,
                        sectionContent,
                        updateRequirement,
                    }),
                    output: Output.object({
                        schema: z.object({
                            input: z.array(z.string()).describe("Input values required to determine the section content."),
                            method: method,
                            generation_details: z.string().describe("Detailed explanation of how the section content should be generated or updated based on the inferred section and provided information."),
                        })
                    })
                })

                return output;
            }

        } catch (error) {
            console.error("Error in findSectionContextTool:", error);
            throw new Error("Failed to find relevant context for the policy section.");
        }
    },
});



export const rewriteForSectionTool = (
    dataStream: UIMessageStreamWriter<ChatMessageAI>,
    threadId: string,
    version: number | null,
    originalContent: string,
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
            sectionId: z.string().describe("Section Heading of the section to be updated"),
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

                const { output } = await generateText({
                    model: openai("gpt-5"),
                    prompt,
                    output: Output.object({
                        schema: z.object({
                            text: z.string().describe("The rewritten content relevant to the policy section."),
                            changeNotes: z.string().describe("Notes on what was changed and why, for audit purposes max 1 sentence."),
                        })
                    })
                });

                const { text: rewrittenContent } = await generateText({
                    model: openai("gpt-5"),
                    prompt: rewritePolicySectionPrompt({
                        originalContent: originalContent,
                        rewrittenContent: output.text,
                    })
                });

                const updatedPolicy = await updatePolicyContent(threadId, rewrittenContent, `[AGENT]: ${output.changeNotes}`, version);

                dataStream.write({
                    id: `rewrite-${sectionId}-${Date.now()}`,
                    type: "data-update-section",
                    data: {
                        updatedPolicy,
                        sectionId: sectionId,
                        rewrittenInfo: output.text,
                        changeNotes: output.changeNotes,
                        version: updatedPolicy.version,
                    } satisfies PolicyUpdateProps,
                });

                return {
                    text: output.text,
                    changeNotes: output.changeNotes,
                };
            } catch (error) {
                console.error("Error in rewriteForSectionTool:", error);
                throw new Error("Failed to rewrite content for the policy section.");
            }
        },
    });
