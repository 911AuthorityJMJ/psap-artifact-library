// Shared, client-safe types describing the fields the Document Builder renders.
// The template-fields route produces these; DocumentBuilder consumes them. Kept
// in its own module (no server imports) so the client component never pulls in
// route/fs code just to get a type.

import type { FieldType, AutoFillKey } from './field-registry.mjs';

/** A single fillable value. */
export interface ScalarField {
  kind: 'scalar';
  /** docxtemplater tag name */
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  autoFill?: AutoFillKey;
  placeholder?: string;
}

/** One column of a repeating loop row. */
export interface LoopSubField {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
}

/** A repeating section ({#name}…{/name}) the user fills as rows. */
export interface LoopField {
  kind: 'loop';
  /** docxtemplater section tag */
  name: string;
  label: string;
  maxRows?: number;
  fields: LoopSubField[];
}

export type BuilderField = ScalarField | LoopField;

/** Fields grouped under one of the document's own section headings. */
export interface TemplateSection {
  heading: string;
  fields: BuilderField[];
}

export interface TemplateFieldsResponse {
  artifactId: string;
  artifactName: string;
  /** fields grouped by the document's section headings, in document order */
  sections: TemplateSection[];
  /** readable HTML preview; each placeholder is a <span class="tpl-slot" data-field="…"> */
  previewHtml: string;
}
