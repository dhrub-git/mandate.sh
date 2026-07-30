/**
 * Shared markdown section parser (## headings).
 * Used by policy persistence and the policy generator.
 */
export function parseSections(
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
