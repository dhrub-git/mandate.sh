import { ContentBlock } from "@langchain/core/messages";
import { model } from "../config/model";
import { WorkflowState } from "../graph/state";
import { saveAdditionalData, createPolicy } from "@repo/database";
import { applyDeterministicSections } from "../config/deterministicSections";
import { parseOnboardingData } from "../config/onboardingContext";
import { sanitizeMessages, contentToString } from "./messageUtils";

function parseSections(
  policyText?: string | null,
): { title: string; content: string }[] {
  if (!policyText || typeof policyText !== "string") return [];

  const sectionRegex = /^##\s+(.+?)\n([\s\S]*?)(?=^##\s+|\Z)/gm;

  const sections: { title: string; content: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = sectionRegex.exec(policyText)) !== null) {
    const rawTitle = match[1]?.trim();
    const content = match[2]?.trim() ?? "";

    if (!rawTitle) continue;

    const title = rawTitle.replace(/^\d+[\.\)]\s*/, "").trim();
    sections.push({ title, content });
  }

  return sections;
}

function getContentAsString(
  content: string | (ContentBlock | ContentBlock.Text)[],
): string {
  return contentToString(content);
}

export async function policyGenerator(state: WorkflowState) {
  console.log("Entering policy generator");

  const messages = state.messages;
  const cleanMessages = sanitizeMessages(messages);
  const response = await model.invoke(cleanMessages);

  if (response.tool_calls?.length) {
    return { messages: [response] };
  }
  console.log("policy generator end");

  const rawPolicy = getContentAsString(response.content);
  const policyContent = applyDeterministicSections(
    rawPolicy,
    state.onboarding_data,
    state.risk_classifications,
  );
  const sections = parseSections(policyContent);
  const threadId = state.thread_id;

  const onboarding = parseOnboardingData(state.onboarding_data);
  const companyId = onboarding.companyId;

  if (!companyId) {
    throw new Error("companyId not found in onboarding_data");
  }

  await Promise.all([
    createPolicy(companyId, threadId, policyContent, sections),
    saveAdditionalData(companyId, threadId, state),
  ]);
  console.log("Policy saved to database");

  return {
    messages: [response],
    policies: policyContent,
  };
}
