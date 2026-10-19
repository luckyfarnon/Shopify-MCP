import { z } from "zod";

/**
 * Escape a user-supplied term before embedding it in a Shopify search query,
 * so it cannot inject extra filters or operators.
 */
export function escapeSearchTerm(term: string): string {
  return term.replace(/["\\*:()<>=]/g, " ").replace(/\s+/g, " ").trim();
}

export function titleQuery(term?: string): string | undefined {
  const cleaned = term ? escapeSearchTerm(term) : "";
  return cleaned ? `title:*${cleaned}*` : undefined;
}


/** Shopify global ID for a specific resource type, e.g. gid://shopify/Product/123 */
export const gid = (type: string) =>
  z
    .string()
    .regex(
      new RegExp(`^gid://shopify/${type}/\\d+$`),
      `Must be a Shopify GID like gid://shopify/${type}/1234567890`
    );

/**
 * Remove active content (scripts, frames, inline handlers, javascript: URLs)
 * from HTML before it is written to the store, so a prompt-injected or
 * mistaken model output cannot plant stored XSS on the storefront.
 */
export function stripActiveHtml(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form)\b[\s\S]*?(<\s*\/\s*\1\s*>|$)/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form)\b[^>]*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src|xlink:href|action|formaction)\s*=\s*("|')?\s*(javascript|vbscript|data):[^"'>\s]*("|')?/gi, "");
}

export const safeHtml = z.string().max(200_000).transform(stripActiveHtml);

export const shortText = z.string().max(1000);
export const tagList = z.array(z.string().max(255)).max(250);
