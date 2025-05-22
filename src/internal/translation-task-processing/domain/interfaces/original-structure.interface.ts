/**
 * Represents the structure of the original content needed for reconstruction.
 * - For HTML: DOM/AST with node hierarchy and segment mapping.
 * - For XLIFF: mapping of trans-unit IDs to segment orders and attributes.
 * - For CSV/SRT/Plain text: row/column or timestamp mappings.
 */
export interface OriginalStructure {
  [key: string]: unknown;
}
