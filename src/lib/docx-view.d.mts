// Types for docx-view.mjs.

export interface DocSection {
  /** the section's heading text ("2. System Identification"), or "Overview" for pre-heading content */
  heading: string;
  /** field/loop tag names that appear under this heading, in document order */
  tagNames: string[];
}

export interface DocxView {
  /** readable HTML render; each placeholder is a <span class="tpl-slot" data-field="…"> */
  previewHtml: string;
  /** document sections in order (first is "Overview") */
  sections: DocSection[];
  /** tag name → the "Label:" text found next to it in the document, if any */
  labels: Record<string, string>;
}

export declare function buildDocxView(documentXml: string): DocxView;
