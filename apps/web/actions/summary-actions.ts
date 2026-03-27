"use server";
import {generateText, Output} from "ai";
import {google} from "@ai-sdk/google";
import {z} from "zod";
import { getPoliciesByCompany , getCompanyInfo} from "@repo/database";
// Schema for the summary output
const summaryOutputSchema = z.object({
  summary: z.string().describe("The executive summary in markdown format"),
  wordCount: z.number().describe("Approximate word count of the summary"),
  keyHighlights: z.array(z.string()).describe("3-5 key takeaways as an array"),
});
export type SummaryOutput = z.infer<typeof summaryOutputSchema>;
// Response type for the action
export type GenerateSummaryResult = 
  | { success: true; data: SummaryOutput; generatedAt: string }
  | { success: false; error: string };
const EXECUTIVE_SUMMARY_PROMPT = `
You are an expert policy analyst specializing in AI governance.
Your task is to generate a concise EXECUTIVE SUMMARY of the provided AI Governance Policy.
---
## 📋 Summary Requirements
The executive summary must include:
1. **Purpose Statement** (2-3 sentences)
   - Why this policy exists
   - What it aims to achieve
2. **Scope Overview** (2-3 sentences)
   - Who/what is covered
   - Key AI systems or processes included
3. **Key Governance Highlights** (4-6 bullet points)
   - Critical roles and responsibilities
   - Major governance mechanisms
   - Risk management approach
4. **Regulatory Alignment** (2-3 sentences)
   - Key regulations addressed
   - Compliance commitments
5. **Review & Accountability** (1-2 sentences)
   - Policy review frequency
   - Primary accountable parties
---
## 🎯 Format Requirements
- Total length: 300-500 words
- Use clear, professional language
- Use markdown formatting (headers, bullets)
- Make it scannable for executives
- Avoid technical jargon where possible
---
## 🏢 Company Context
{companyName}
---
## 📄 Full Policy Document
"""
{policyContent}
"""
---
Generate the executive summary now.
`;
export async function generateExecutiveSummary(
  threadId: string
): Promise<GenerateSummaryResult> {
  try {
    // Validate input
    if (!threadId) {
      return { success: false, error: "Thread ID is required" };
    }
    // Fetch the current policy
    const policyData = await getPoliciesByCompany(threadId);
    console.log("Fetched policy data:", policyData);
    if (!policyData.current?.content) {
      return { success: false, error: "No policy found for this thread" };
    }
    // Fetch company info for context
    const companyInfo = await getCompanyInfo(policyData.current.companyId);
    console.log("Fetched company info:", companyInfo);
    const companyName = companyInfo?.name || "Unknown Company";
    // Build the prompt
    const prompt = EXECUTIVE_SUMMARY_PROMPT
      .replace("{policyContent}", policyData.current.content)
      .replace("{companyName}", companyName);
    // Generate the summary using AI
    const result = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
      output: Output.object({
        schema: summaryOutputSchema,
      }),
    });
    return {
      success: true,
      data: result.output,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error generating executive summary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate executive summary",
    };
  }
}