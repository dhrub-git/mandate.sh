import type { AISystemInput } from "./types";

/**
 * Parse Stage 2 LLM output into structured AISystemInput[].
 * Tries JSON extraction first, then regex fallback, then single-system fallback.
 */
export function parseStage2Output(
  aiMessage: string,
  onboardingData?: string,
): AISystemInput[] {
  // Try 1: Extract JSON array from message
  const jsonSystems = tryParseJson(aiMessage);
  if (jsonSystems.length > 0) return jsonSystems;

  // Try 2: Regex-based extraction
  const regexSystems = tryParseRegex(aiMessage);
  if (regexSystems.length > 0) return regexSystems;

  // Try 3: Fallback — create a single system from whatever we can find
  return createFallbackSystem(aiMessage, onboardingData);
}

function tryParseJson(message: string): AISystemInput[] {
  // Strip markdown fences so raw JSON is easier to find
  const cleaned = message.replace(/```(?:json)?\s*([\s\S]*?)```/gi, "$1");

  const candidates: string[] = [];

  // Prefer an object with a systems array
  const systemsObj = cleaned.match(
    /\{[\s\S]*"systems"\s*:\s*\[[\s\S]*\][\s\S]*\}/,
  );
  if (systemsObj) candidates.push(systemsObj[0]);

  // Or a bare array of system objects
  const arrayMatch = cleaned.match(
    /\[[\s\S]*(?:"systemName"|"system_name"|"Q11")[\s\S]*\]/,
  );
  if (arrayMatch) candidates.push(arrayMatch[0]);

  for (const candidate of candidates) {
    try {
      // Truncate to balanced JSON if regex over-captured trailing prose
      const balanced = extractBalancedJson(candidate);
      let parsed = JSON.parse(balanced);
      if (parsed?.systems) parsed = parsed.systems;
      if (!Array.isArray(parsed)) parsed = [parsed];

      const mapped = parsed
        .filter(
          (s: Record<string, unknown>) =>
            s &&
            (s.systemName || s.system_name || s.name || s.Q11),
        )
        .map((s: Record<string, unknown>) => {
          const categories =
            s.functionCategories ||
            s.function_categories ||
            s.categories ||
            s.Q15;
          return {
            systemName: String(
              s.systemName || s.system_name || s.name || s.Q11 || "Unknown",
            ),
            devSource: String(
              s.devSource ||
                s.dev_source ||
                s.source ||
                s.Q12 ||
                "Unknown",
            ),
            purpose: String(
              s.purpose || s.description || s.use || s.Q14 || s.Q11b || "",
            ),
            functionCategories: Array.isArray(categories)
              ? (categories as string[])
              : typeof categories === "string"
                ? categories
                    .split(/[,;]/)
                    .map((c) => c.trim())
                    .filter(Boolean)
                : [],
          };
        });

      if (mapped.length > 0) return mapped;
    } catch {
      continue;
    }
  }

  return [];
}

/** Return the longest prefix of `text` that is balanced `{...}` or `[...]`. */
function extractBalancedJson(text: string): string {
  const start = text.search(/[\{\[]/);
  if (start < 0) return text;
  const open = text[start]!;
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i]!;
    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === open) depth++;
    if (ch === close) {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return text.slice(start);
}

function tryParseRegex(message: string): AISystemInput[] {
  const systems: AISystemInput[] = [];

  // Split by system markers
  const systemBlocks = message.split(/(?:system\s*(?:\d+|#\d+)|(?:^|\n)(?:\d+)\.\s*\*\*)/i);

  for (const block of systemBlocks) {
    if (block.trim().length < 20) continue;

    const nameMatch = block.match(/(?:name|system)\s*(?::|—)\s*(.+?)(?:\n|$)/i);
    const purposeMatch = block.match(/(?:purpose|description|use)\s*(?::|—)\s*(.+?)(?:\n|$)/i);
    const categoriesMatch = block.match(/(?:categor|function)\s*(?:ies|s)?\s*(?::|—)\s*(.+?)(?:\n|$)/i);
    const sourceMatch = block.match(/(?:source|developed|provider|deployer|in-house|third.?party)\s*(?::|—)?\s*(.+?)(?:\n|$)/i);

    if (nameMatch) {
      systems.push({
        systemName: nameMatch[1]!.replace(/\*\*/g, "").trim(),
        devSource: sourceMatch ? sourceMatch[1]!.trim() : "Unknown",
        purpose: purposeMatch ? purposeMatch[1]!.trim() : "",
        functionCategories: categoriesMatch
          ? categoriesMatch[1]!.split(/[,;]/).map((c) => c.trim()).filter(Boolean)
          : [],
      });
    }
  }

  return systems;
}

function createFallbackSystem(
  message: string,
  onboardingData?: string,
): AISystemInput[] {
  let companyName = "AI System";
  if (onboardingData) {
    try {
      const data = JSON.parse(onboardingData);
      companyName = data.name || companyName;
    } catch { /* ignore */ }
  }

  // Try to extract at least a system name from the message
  const nameMatch = message.match(/(?:inventoried|identified|found)\s+.*?(?:system|platform|tool)s?\s*(?::|—)?\s*(.+?)(?:\.|$)/i);
  const name = nameMatch ? nameMatch[1]!.replace(/\*\*/g, "").trim() : `${companyName} AI System`;

  return [{
    systemName: name,
    devSource: "Unknown",
    purpose: message.substring(0, 200),
    functionCategories: ["Data analysis"],
  }];
}
