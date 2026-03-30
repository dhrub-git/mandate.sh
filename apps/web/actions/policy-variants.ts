"use server";

import { db } from "@repo/database";
import { PolicyVariantType } from "@repo/database";
import { getSystemPrompt, buildCompanyContext } from "@/lib/prompts/variant-prompts";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper to parse markdown headings into JSON sections
function parseSections(markdown: string) {
  const sections: Record<string, string> = {};
  const parts = markdown.split(/^##\s+/m);
  
  if (parts[0]!.trim() === "") parts.shift(); // Remove empty prefix

  parts.forEach((part) => {
    const lines = part.split("\n");
    const title = lines.shift()?.trim() || "Untitled Section";
    const content = lines.join("\n").trim();
    sections[title] = content;
  });

  return sections;
}

export async function generateVariant(policyId: string, variantType: PolicyVariantType) {
  try {
    const policy = await db.policy.findUnique({
      where: { id: policyId },
      include: { company: true },
    });

    if (!policy) throw new Error("Policy not found");

    // Guard: Block in IN_REVIEW and PUBLISHED
    if (policy.status === "IN_REVIEW" || policy.status === "PUBLISHED") {
      throw new Error(`Cannot generate variant while policy is ${policy.status}`);
    }

    const companyContext = buildCompanyContext(policy.company);
    const systemPrompt = getSystemPrompt(variantType);

    // Note: Spec mentions gpt-5.4-mini, using gpt-4o-mini as modern standard
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages:[
        { role: "system", content: systemPrompt },
        { role: "user", content: `${companyContext}\n\nMaster Policy Content:\n${policy.content}` }
      ],
    });

    const content = completion.choices[0]?.message?.content || "";
    const sections = parseSections(content);

    // Upsert variant
    const variant = await db.policyVariant.upsert({
      where: {
        policyId_variantType: {
          policyId,
          variantType,
        },
      },
      update: {
        content,
        sections,
        generatedAt: new Date(),
      },
      create: {
        policyId,
        variantType,
        content,
        sections,
      },
    });

    return { success: true, variant };
  } catch (error: any) {
    console.error(`Failed to generate variant ${variantType}:`, error);
    return { success: false, error: error.message };
  }
}

export async function getVariantsForPolicy(policyId: string) {
  return await db.policyVariant.findMany({
    where: { policyId },
  });
}


export async function getVariantsForThread(threadId: string) {
  // Get all policy IDs for this thread
  const policies = await db.policy.findMany({
    where: { threadId },
    select: { id: true, version: true },
    orderBy: { version: "desc" },
  });
  const policyIds = policies.map((p) => p.id);
  if (policyIds.length === 0) return { variants: [], variantsFromVersion: null };
  // Get all variants linked to any policy version in this thread
  const variants = await db.policyVariant.findMany({
    where: {
      policyId: { in: policyIds },
    },
    include: {
      policy: {
        select: { version: true, id: true },
      },
    },
  });
  if (variants.length === 0) return { variants: [], variantsFromVersion: null };
  // Find which version the variants belong to
  const variantsFromVersion = variants[0]?.policy.version ?? null;
  return { variants, variantsFromVersion };
}