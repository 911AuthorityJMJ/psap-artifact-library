// Type surface for file-naming.mjs (declaration only; no runtime code).

/**
 * Derive the canonical template file-name stem from an artifact's display
 * name, e.g. "RACI Matrix for Cybersecurity" → "RACIMatrixForCybersecurity".
 */
export function toFileNameStem(name: string): string;
