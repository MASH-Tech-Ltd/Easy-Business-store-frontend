/**
 * Pure text cleaners for store names and copyright notices.
 * Completely safe to import in both Server and Client Components.
 */

/** Strip any platform or builder suffixes (e.g. "- MASH ECO", "Product Of MASH TECH") */
export function cleanStoreName(raw?: string | null): string {
  if (!raw) return '';
  return raw
    .replace(/\s*[-|•·]?\s*Powered\s+by\s+(MASH\s*ECO|MASH\s*TECH)[^.]*$/i, '')
    .replace(/\s*[-|•·]?\s*(A\s+Product\s+Of\s+)?(MASH\s*TECH|MASH\s*ECO)[^.]*$/i, '')
    .trim();
}

/** Sanitize copyright text so platform / builder references never appear in UI or Google snippets */
export function cleanCopyright(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/\s*[-|•·]?\s*Powered\s+by\s+(MASH\s*ECO|MASH\s*TECH)[^.]*\.?/gi, '')
    .replace(/\s*[-|•·]?\s*(A\s+Product\s+Of\s+)?(MASH\s*TECH|MASH\s*ECO)[^.]*\.?/gi, '')
    .trim();
}
