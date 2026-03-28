import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { visit } from "unist-util-visit";

export async function updateMarkdownSectionAST(
  markdown: string,
  sectionTitle: string,
  newContent: string
): Promise<string> {
  const tree = unified().use(remarkParse).parse(markdown);

  let targetIndex = -1;
  let targetDepth = -1;

  // 1. Find the heading node
  visit(tree, "heading", (node: any, index: number | undefined, parent: any) => {
    const text = node.children
      .filter((c: any) => c.type === "text")
      .map((c: any) => c.value)
      .join("")
      .trim();

    if (text === sectionTitle && targetIndex === -1 && index !== undefined) {
      targetIndex = index;
      targetDepth = node.depth;
    }
  });

  // 2. If not found → append new section
  if (targetIndex === -1) {
    const newTree = unified().use(remarkParse).parse(
      `\n## ${sectionTitle}\n\n${newContent}\n`
    );

    (tree as any).children.push(...(newTree as any).children);

    return unified().use(remarkStringify).stringify(tree);
  }

  const parent = (tree as any);
  const children = parent.children;

  // 3. Find where this section ends
  let endIndex = children.length;

  for (let i = targetIndex + 1; i < children.length; i++) {
    const node = children[i];

    if (node.type === "heading" && node.depth <= targetDepth) {
      endIndex = i;
      break;
    }
  }

  // 4. Parse new content into AST nodes
  const newContentTree = unified().use(remarkParse).parse(newContent);

  const newNodes = (newContentTree as any).children;

  // 5. Replace only the section content
  children.splice(targetIndex + 1, endIndex - targetIndex - 1, ...newNodes);

  // 6. Stringify with formatting preserved
  return unified()
    .use(remarkStringify, {
      bullet: "-",          // preserve list style
      fences: true,         // preserve code blocks
      listItemIndent: "one",
      incrementListMarker: false,
    })
    .stringify(tree);
}