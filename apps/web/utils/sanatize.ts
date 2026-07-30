import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

export function sanitize(html: string) {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },

    // Optional: tighten security
    FORBID_TAGS: ["script", "iframe", "object"],
    FORBID_ATTR: ["onerror", "onclick", "onload"],
  });
}

export function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}