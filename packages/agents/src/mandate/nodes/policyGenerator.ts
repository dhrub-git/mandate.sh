import { ContentBlock } from "@langchain/core/messages";
import { model } from "../config/model";
import { WorkflowState } from "../graph/state";
import { saveAdditionalData, createPolicy } from "@repo/database"

function sanitizeMessages(messages: any[]) {
  return messages.map((m) => {
    if (typeof m.content === "string") return m;

    if (Array.isArray(m.content)) {
      const text = m.content
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text ?? "")
        .join("");

      return {
        ...m,
        content: text,
      };
    }

    return m;
  });
}

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

function getContentAsString(
  content: string | (ContentBlock | ContentBlock.Text)[]
): string {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((block) => {
      if (!block) return "";

      // Handle text-like blocks safely
      if (typeof block === "string") return block;

      if ("text" in block && typeof block.text === "string") {
        return block.text;
      }

      return "";
    })
    .join("");
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
  const policyContent = getContentAsString(response.content);
  const sections = parseSections(policyContent);
  const threadId = state.thread_id;
  let companyId: string | undefined;
  try {
    const parsed = JSON.parse(state.onboarding_data);
    companyId = parsed?.companyId;
  } catch (error) {
    console.error("Failed to parse onboarding_data:", error);
  }

  if (!companyId) {
    throw new Error("companyId not found in onboarding_data");
  }

  await Promise.all([
    createPolicy(companyId, threadId, policyContent, sections),
    saveAdditionalData(companyId, threadId, state)
  ])
  console.log("Policy saved to database");

  return {
    messages: [response],
    policies: response.content,
  };
}