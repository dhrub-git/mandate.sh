import { ContentBlock } from "@langchain/core/messages";
import { model } from "../config/model";
import { WorkflowState } from "../graph/state";
import {
  saveAdditionalData,
  createPolicy,
  parseSections,
} from "@repo/database";
import { applyDeterministicSections } from "../config/deterministicSections";
import { parseOnboardingData } from "../config/onboardingContext";
import { sanitizeMessages, contentToString } from "./messageUtils";

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
