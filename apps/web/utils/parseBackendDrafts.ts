export const parseBackendDrafts = (drafts: Record<string, string>) => {
  const parsed: Record<string, string> = {};

  const fullText = Object.values(drafts)
    .filter(Boolean)
    .join("\n\n")
    .replace(/```markdown/gi, "")
    .replace(/```/g, "");

  const extract = (key: string, regex: RegExp) => {
    const match = fullText.match(regex);
    if (match?.[1]) parsed[key] = match[1].trim();
  };

  extract(
     "purpose",
  /^\s*#{1,3}\s*(?:\d+\.\s*)?Purpose\s*&\s*Scope([\s\S]*?)(?=^\s*#{1,3}\s|$)/im,
  );
  extract(
    "inventory",
  /^\s*#{1,3}\s*(?:\d+\.\s*)?(?:AI\s*System\s*)?Inventory([\s\S]*?)(?=^\s*#{1,3}\s|$)/im,
  );
  extract(
    "governance",
    /^#{1,2}\s*(?:\d+\.\s*)?Governance.*?Structure([\s\S]*?)(?=^#{1,2}\s|$)/im,
  );
  extract(
    "roles",
    /^#{1,2}\s*(?:\d+\.\s*)?Roles.*?Responsibilities([\s\S]*?)(?=^#{1,2}\s|$)/im,
  );
  extract(
    "regulations",
    /^#{1,2}\s*(?:\d+\.\s*)?Applicable.*?Regulations([\s\S]*?)(?=^#{1,2}\s|$)/im,
  );
  extract("risk", /^#{1,2}\s*(?:\d+\.\s*)?Risk.*?Appetite([\s\S]*?)(?=^#{1,2}\s|$)/im);

  return parsed;
};
