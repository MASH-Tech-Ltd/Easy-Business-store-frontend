/**
 * Pure text cleaners for store names, descriptions, and copyright notices.
 * Completely safe to import in both Server and Client Components.
 */

/** Decodes common HTML entities into human-readable characters */
export function decodeHtmlEntities(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ');
}

/** Preserves full store name exactly as configured by merchant (decodes HTML entities and trims) */
export function cleanStoreName(raw?: string | null): string {
  if (!raw) return '';
  return decodeHtmlEntities(raw).trim();
}

/** Sanitize copyright text so platform / builder references never appear in UI or Google snippets */
export function cleanCopyright(text?: string | null): string {
  if (!text) return '';
  return decodeHtmlEntities(text)
    .replace(/\s*[-|•·]?\s*Powered\s+by\s+(MASH\s*ECO|MASH\s*TECH)[^.]*\.?/gi, '')
    .replace(/\s*[-|•·]?\s*(A\s+Product\s+Of\s+)?(MASH\s*TECH|MASH\s*ECO)[^.]*\.?/gi, '')
    .trim();
}

/** Strips any HTML tags and decodes entities for safe meta/SEO descriptions */
export function cleanMetaDescription(text?: string | null): string {
  if (!text) return '';
  const stripped = text.replace(/<[^>]*>?/gm, ' ');
  return decodeHtmlEntities(stripped)
    .replace(/\s+/g, ' ')
    .trim();
}
