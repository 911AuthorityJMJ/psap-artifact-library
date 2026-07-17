// Shared UI/server contract for repeating-loop row caps. The template-fields
// route sends these caps to the builder and the generate-document route
// enforces them, so importing both sides from here guarantees the builder
// never offers more rows than the generator will render.

/** Rows per loop when the loop's registry entry declares no maxRows. */
export const DEFAULT_MAX_ROWS = 50;

/** Hard ceiling on rows per loop, regardless of the loop's declared maxRows. */
export const MAX_ROWS_CEILING = 500;

/** The effective row cap for a loop given its (optional) declared maxRows. */
export function effectiveMaxRows(declared: number | undefined): number {
  return Math.min(declared ?? DEFAULT_MAX_ROWS, MAX_ROWS_CEILING);
}
