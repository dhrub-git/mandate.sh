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
  // Look for JSON array or object blocks in the message
  const jsonPatterns = [
    /\[[\s\S]*?\{[\s\S]*?"systemName"[\s\S]*?\}[\s\S]*?\]/,
    /\[[\s\S]*?\{[\s\S]*?"system_name"[\s\S]*?\}[\s\S]*?\]/,
    /\{[\s\S]*?"systems"[\s\S]*?:[\s\S]*?\[[\s\S]*?\][\s\S]*?\}/,
  ];

  for (const pattern of jsonPatterns) {
    const match = message.match(pattern);
    if (!match) continue;

    try {
      let parsed = JSON.parse(match[0]);
      if (parsed.systems) parsed = parsed.systems;
      if (!Array.isArray(parsed)) parsed = [parsed];

      return parsed
        .filter((s: Record<string, unknown>) => s.systemName || s.system_name || s.name)
        .map((s: Record<string, unknown>) => ({
          systemName: String(s.systemName || s.system_name || s.name || "Unknown"),
          devSource: String(s.devSource || s.dev_source || s.source || "Unknown"),
          purpose: String(s.purpose || s.description || s.use || ""),
          functionCategories: Array.isArray(s.functionCategories || s.function_categories || s.categories)
            ? (s.functionCategories || s.function_categories || s.categories) as string[]
            : [],
        }));
    } catch {
      continue;
    }
  }

  return [];
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
