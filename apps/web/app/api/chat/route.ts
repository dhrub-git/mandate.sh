import { ChatSDKError } from "@/lib/ai-error";
import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
} from "ai";
import { google } from "@ai-sdk/google";
import { ChatMessageAI } from "@/utils/types";
import { findSectionContextTool, rewriteForSectionTool } from "@/lib/tools/policy-tools";
import { getCompanyInfo, getPoliciesByCompany } from "@repo/database";
import { jsonToMarkdownTable } from "@/utils/contextualize-json";
import { openai } from "@ai-sdk/openai";




interface ChatRequestBody {
  threadId: string;
  messages: ChatMessageAI[];
  version?: number;
}

const SYSTEM_PROMPT = `
You are a Policy Update Agent.

Your ONLY responsibility is to process user-provided updates to an existing policy document.

---

## 🎯 Core Responsibilities
- Understand what the user wants to change in the policy
- Identify the correct policy section(s)
- Use tools to:
  1. Fetch section-specific context
  2. Rewrite content appropriately
  3. Persist updates via tools

---

## ⚙️ How You Must Operate

- DO NOT manually rewrite policy content yourself
- ALWAYS use the available tools to perform updates
- NEVER output full policy sections directly
- The system persists updates via tools (dataStream)

---

## 🧠 Decision Flow

1. Identify which section the user is referring to
2. Call "findSectionContext" if you need section guidance
3. Call "rewriteForSection" to generate updated content
4. Repeat for multiple sections if needed

---

## 🧾 Final Response Rules

- Your final response should ONLY summarize what updates were made
- Keep it concise and structured
- Do NOT include rewritten content
- Do NOT include markdown sections
- Do NOT explain tool usage

---

## ✅ Example Response

"Updated the following sections:
- Risk Appetite Statement: Refined to include stricter risk thresholds
- Governance Structure: Added escalation responsibilities"

---

## 🚫 Strict Prohibitions

- Do NOT generate policy content directly
- Do NOT ask unnecessary questions
- Do NOT be conversational unless clarification is absolutely required

---

Focus on executing updates efficiently and accurately.
`;

export async function POST(req: Request) {
  const { threadId, messages, version }: ChatRequestBody = await req.json();
  console.log(`Processing Thread Id ${threadId} Version ${version ?? "current"}`);

  try {
    const draftPolicy = await getPoliciesByCompany(threadId);
    if (!draftPolicy.current) {
      throw new ChatSDKError("bad_request:chat", "No existing policy found for this thread");
    }
    const currentPolicyContent = version ? draftPolicy.versions.find((v) => v.version === version)!.content : draftPolicy.current!.content;
    const companyInfo = await getCompanyInfo(draftPolicy.current!.companyId); // Implement this function to fetch company info based on threadId
    const stream = createUIMessageStream({
      originalMessages: messages,
      execute: async ({ writer: dataStream }) => {
        const result = streamText({
          model: openai("gpt-5"),
          system: `${SYSTEM_PROMPT}
          ---
          Current Policy Content:
          ${currentPolicyContent}
          ---
          Company Information:
          ${jsonToMarkdownTable(companyInfo)}
          `,
          messages: await convertToModelMessages(messages),
          toolChoice: "auto",
          tools: {
            findSectionContext: findSectionContextTool,
            rewriteForSection: rewriteForSectionTool(dataStream, threadId, version ?? null, currentPolicyContent),
          },
          stopWhen: stepCountIs(5),
          experimental_transform: smoothStream({ chunking: "word" }),
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          }),
        );
      },
      onError: (error) => {
        console.error("Stream error:", {
          error,
          chatId: threadId,
          vercelId: req.headers.get("x-vercel-id"),
        });

        // Return user-friendly message based on error type
        if (error instanceof ChatSDKError) {
          return error.message;
        }
        if (error instanceof Error && error.message.includes("rate limit")) {
          return "Too many requests. Please wait a moment.";
        }
        return "An error occurred while processing your request.";
      },
    });

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  } catch (error) {
    const vercelId = req.headers.get("x-vercel-id");
    console.error("Unhandled error in chat API:", error, { vercelId });
    return new ChatSDKError("offline:chat").toResponse();
  }
}
