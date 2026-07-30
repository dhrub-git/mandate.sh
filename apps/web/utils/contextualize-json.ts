type AnyObject = Record<string, any>;

export function jsonToMarkdownTable(input: AnyObject): string {
  const rows: { key: string; value: string }[] = [];

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "-";

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        if (value.length === 0) return "[]";

        // If array of primitives
        if (value.every(v => typeof v !== "object")) {
          return value.join(", ");
        }

        // If array of objects
        return value
          .map((item, i) => `(${i + 1}) ${JSON.stringify(item)}`)
          .join("<br/>");
      }

      // Object → stringify compact
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${formatValue(v)}`)
        .join("<br/>");
    }

    return String(value);
  };

  const flatten = (obj: AnyObject, parentKey = "") => {
    for (const [key, value] of Object.entries(obj)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        flatten(value, newKey);
      } else {
        rows.push({
          key: newKey,
          value: formatValue(value),
        });
      }
    }
  };

  flatten(input);

  if (rows.length === 0) return "";

  const header = `| Key | Value |\n|-----|-------|`;
  const body = rows
    .map(row => `| ${row.key} | ${row.value} |`)
    .join("\n");

  return `${header}\n${body}`;
}