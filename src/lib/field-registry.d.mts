// Type surface for field-registry.mjs (declaration only; no runtime code).
// The registry is the single source of truth mapping [Bracket Syntax]
// placeholders in the .docx FORM templates to fillable docxtemplater fields.

export type FieldType = 'text' | 'date' | 'textarea' | 'select';
export type AutoFillKey = 'name' | 'director' | 'directorEmail';

export interface FieldDef {
  /** camelCase canonical docxtemplater tag, e.g. {agencyName} */
  id: string;
  label: string;
  /** default 'text' */
  type?: FieldType;
  /** NORMALIZED bracket strings that resolve to this field (many->one). */
  aliases: string[];
  /** curated choices; required when type === 'select' */
  options?: string[];
  autoFill?: AutoFillKey;
  placeholder?: string;
  required?: boolean;
  /**
   * A single document-wide value (identity/metadata/signature). Repeated
   * occurrences intentionally COLLAPSE to one tag (fill once). Non-shared
   * fields disambiguate per occurrence so distinct cells stay independently
   * fillable — see the converter's disambiguation pass.
   */
  shared?: boolean;
}

export interface LoopDef {
  /** docxtemplater section tag: {#id}...{/id} */
  id: string;
  label: string;
  /** per-row sub-fields */
  fields: FieldDef[];
  maxRows?: number;
  /** true = needs template authoring ({#id}...{/id}) to activate */
  proposed?: boolean;
  /** source artifact + table the loop models */
  templateHint?: string;
}

/** How a bracket is treated during conversion / linting. */
export type BracketClass =
  | 'field-registry' // a curated FieldDef alias -> {canonicalId}
  | 'field-generic'  // a clean value not yet curated -> {deterministicSlug}
  | 'instructional'  // author-facing prose -> leave literal
  | 'ignore'         // banner/empty/numeric/symbol -> leave literal
  | 'ambiguous';     // needs a human decision -> leave literal, linter flags

export declare const FIELDS: FieldDef[];
export declare const LOOPS: LoopDef[];
export declare const INSTRUCTIONAL: string[];
export declare const IGNORE: string[];

/** Fold a raw bracket to its canonical comparison form (see .mjs for rules). */
export declare function normalizeBracket(raw: string): string;
/** Classify a raw bracket for conversion / linting. */
export declare function classifyBracket(raw: string): BracketClass;
/** The docxtemplater tag a bracket converts to, or null to leave it literal. */
export declare function convertBracket(raw: string): string | null;
/** Resolve a raw-or-normalized bracket to its FieldDef, or null. */
export declare function resolveField(rawOrNormalized: string): FieldDef | null;
/** Resolve a canonical tag id (e.g. from getTags) to its FieldDef, or null. */
export declare function resolveFieldById(id: string): FieldDef | null;
/** Resolve a possibly disambiguated tag ("severityHml2") to base field + index. */
export declare function resolveFieldForTag(name: string): { field: FieldDef | null; index: number };
/** Resolve a loop section id to its LoopDef, or null. */
export declare function resolveLoopById(id: string): LoopDef | null;
/** Human-readable label fallback for an un-curated tag id. */
export declare function humanizeTag(id: string): string;
/** Deterministic camelCase tag for a field-generic bracket. */
export declare function genericSlug(normalized: string): string;
