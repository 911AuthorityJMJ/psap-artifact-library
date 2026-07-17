// file-naming.mjs
// Single source of truth for deriving a template file-name stem from an
// artifact's display name, e.g. "RACI Matrix for Cybersecurity" →
// "RACIMatrixForCybersecurity". Every on-disk template file MUST be named
// `<id>-<stem>-FORM.<ext>` / `<id>-<stem>-EXAMPLE-<size>.<ext>` with the stem
// produced by this exact function — the client builds download URLs from it
// and the server resolves fill templates from it, so a file whose name was
// cased or worded by hand will 404 (sync-templates validates this).
//
// Imported by BOTH the Node build scripts (scripts/*.mjs|js) and the Next/TS
// app (@/lib/file-naming.mjs). Keep it dependency-free ESM. Types live in
// file-naming.d.mts.

/**
 * Derive the file-name stem for an artifact name: parentheticals dropped,
 * punctuation folded to word breaks, each word upper-cased at its first
 * letter, then concatenated.
 * @param {string} name
 * @returns {string}
 */
export function toFileNameStem(name) {
  return String(name)
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}
