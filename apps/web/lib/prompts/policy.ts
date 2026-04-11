export const generateRewritePrompt = (
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

export const findSectionContextPrompt = ({
  sectionHeading,
  sectionContent,
  updateRequirement,
}: {
  sectionHeading: string;
  sectionContent: string;
  updateRequirement: string;
}) => `
You are a senior AI governance policy expert responsible for mapping incomplete or ambiguous policy sections to a formal policy specification.

Your task is to:
1. Identify the MOST LIKELY section of the AI Governance Policy.
2. Return structured drafting guidance for that section.

---

## INPUT CONTEXT

Section Heading:
${sectionHeading}

Section Content:
${sectionContent}

Update Requirement:
${updateRequirement}

---

## DECISION PROCESS (STRICT)

You MUST:
- Infer the section based on:
  - semantic meaning of the heading
  - intent of the content
  - direction of the update requirement
- Prioritize intent over exact wording
- Avoid guessing if confidence is low

---

## OUTPUT RULES

You MUST return:

1. **input**
   - List of key inputs required to generate/update this section properly

2. **method**
   Choose EXACTLY ONE:
   - DET → deterministic / rules-based
   - LLM → generative reasoning required
   - HYB → mix of deterministic + generative
   - STO + DET → retrieval + deterministic

3. **generation_details**
   - Clear, implementation-level guidance on:
     - what content should exist
     - how it should be structured
     - constraints (legal, compliance, formatting)
     - what to include / avoid
   - This should be actionable (not abstract)

---

## CONFIDENCE HANDLING

- If confident → map to a specific section and give precise guidance
- If NOT confident:
  - DO NOT hallucinate a section
  - Provide best-effort generalized governance guidance
  - Clearly bias toward safe, generic structure

---

## IMPORTANT CONSTRAINTS

- Do NOT invent section IDs
- Do NOT reference unknown frameworks
- Do NOT be vague
- Do NOT repeat the input
- Be concise but precise

---

Return ONLY structured JSON matching the schema.
`;

export const rewritePolicySectionPrompt = ({
  originalContent,
  rewrittenContent,
}: {
  originalContent: string;
  rewrittenContent: string;
}) => `
You are a professional policy editor specializing in AI governance and compliance documents.

Your task is NOT to rewrite the full document.

Your task is to STRICTLY update the Original Content by applying ONLY the changes present in the Rewritten Content Section.

---

## INPUT

# Original Content:
${originalContent}

---

# Rewritten Content Section (Draft):
${rewrittenContent}

---

## CORE OBJECTIVE (CRITICAL)

You MUST produce a FINAL version of the Original Content where:

- ONLY the specific section reflected in the rewritten draft is updated
- ALL other parts of the Original Content remain EXACTLY unchanged

This is a **controlled patch operation**, NOT a rewrite.

---

## NON-NEGOTIABLE RULES

You MUST:

- NOT modify any text outside the scope of the rewritten section
- NOT rephrase unaffected sentences
- NOT improve unrelated paragraphs
- NOT change formatting outside the edited section
- NOT alter structure unless the rewritten section explicitly requires it

You MUST treat the Original Content as immutable except for the targeted section.

---

## SECTION UPDATE RULES

When applying the update:

- Replace ONLY the relevant portion of the Original Content with the improved version
- Ensure the updated section:
  - Preserves the original meaning and intent
  - Incorporates improvements from the rewritten draft
  - Maintains consistency with surrounding content

---

## STRICT PROHIBITIONS

- Do NOT rewrite the entire document
- Do NOT introduce new ideas, requirements, or assumptions
- Do NOT remove existing obligations unless explicitly reflected in the rewritten section
- Do NOT expand scope beyond what exists in the original
- Do NOT "optimize" unaffected content

---

## CONFLICT RESOLUTION

- If the rewritten section conflicts with the original → PRIORITIZE the original meaning
- If the rewritten section introduces errors → CORRECT using the original
- If unclear what to update → MAKE THE MINIMAL POSSIBLE CHANGE

---

## OUTPUT RULES

- Return the FULL updated Original Content
- Do NOT include explanations
- Do NOT include headings or commentary
- Do NOT highlight changes
- Output must appear as a clean, final document

---

REMEMBER:
If you modify anything outside the intended section, the output is INVALID.
`;