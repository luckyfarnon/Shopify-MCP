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
