// docx-view.mjs
// Server-side: turn a COMPILED ({tag}) document.xml into
//   (a) previewHtml — a readable HTML render (paragraphs, tables, headings) where
//       every placeholder becomes a bound "slot" (<span data-field="tag">), and
//   (b) sections — the document's own section structure (numbered-heading heuristic),
//       mapping each field tag to the section it appears under.
// Derived per-document (no universal template). Dependency-free, pragmatic converter:
// readable fidelity, not pixel-perfect Word. Imported by the template-fields route and
// node tests alike. Types in docx-view.d.mts.
/** @typedef {import('./docx-view.d.mts').DocSection} DocSection */
/** @typedef {import('./docx-view.d.mts').DocxView} DocxView */

// {x} field, {#x}/{/x} loop markers
const TAG_RE = /\{([#/]?)([A-Za-z0-9_]+)\}/g;

/** Concatenate a fragment's <w:t> text (already XML-escaped → HTML-safe). */
function extractText(fragment) {
  return [...fragment.matchAll(/<w:t\b[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join('');
}

/** Replace placeholders: {tag} → slot span (+record); {#x}/{/x} → removed (+record loop). */
function slotify(text, record) {
  return text.replace(TAG_RE, (_full, marker, name) => {
    record(name);
    if (marker) return ''; // loop control marker — not shown in the preview
    return `<span class="tpl-slot" data-field="${name}"></span>`;
  });
}

/** Wrap « guidance » notes so they read as muted annotations, not body text. */
function styleGuidance(html) {
  return html.replace(/«([^»]*)»/g, '<span class="tpl-note">«$1»</span>');
}

/**
 * Render a paragraph/cell's runs, preserving bold, then mark slots + guidance.
 * (Placeholders sit within a single run, so slotify over the joined run HTML is
 * safe.) Falls back to plain text if a fragment has no <w:r> runs.
 */
function renderRuns(fragment, record) {
  let out = '';
  let sawRun = false;
  for (const r of fragment.matchAll(/<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g)) {
    sawRun = true;
    const runXml = r[1];
    const text = [...runXml.matchAll(/<w:t\b[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join('');
    if (!text) continue;
    const rPr = runXml.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/)?.[1] ?? '';
    const bold = /<w:b\b/.test(rPr) && !/<w:b\b[^>]*w:val="(?:false|0)"/.test(rPr);
    out += bold ? `<strong>${text}</strong>` : text;
  }
  if (!sawRun) out = extractText(fragment);
  return styleGuidance(slotify(out, record));
}

/** A short, numbered line ("2. System Identification") reads as a section heading. */
function isHeading(text) {
  const t = text.trim();
  // A heading is short, numbered, and holds no fillable placeholder.
  return t.length > 0 && t.length < 70 && !t.includes('{') && /^\d+(\.\d+)*[.)]?\s+\S/.test(t);
}

/** Decode XML entities for text used as plain React text (headings). The preview
 *  HTML keeps entities as-is since it's injected as innerHTML. */
function decodeEntities(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'").replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
    // Decode &amp; LAST: unescaping the '&' meta-entity first would let a
    // literally-encoded entity like "&amp;lt;" (text "&lt;") be re-decoded
    // into "<". (CodeQL js/double-escaping.)
    .replace(/&amp;/g, '&');
}

/** Inline "Label: {tag}" — the field label written just before a placeholder. */
const LABEL_RE = /([A-Za-z][A-Za-z0-9 /&'’,()-]{0,42}?):\s*\{[#/]?([A-Za-z0-9_]+)\}/g;
function cleanLabel(s) {
  return s.trim().split(/\s+/).slice(-6).join(' ');
}
function extractLabels(plainText, setLabel) {
  for (const m of plainText.matchAll(LABEL_RE)) setLabel(m[2], cleanLabel(m[1]));
}

function renderTable(tblXml, record, setLabel) {
  let out = '<table class="tpl-table"><tbody>';
  for (const tr of tblXml.matchAll(/<w:tr\b[\s\S]*?<\/w:tr>/g)) {
    out += '<tr>';
    for (const tc of tr[0].matchAll(/<w:tc\b[\s\S]*?<\/w:tc>/g)) {
      extractLabels(extractText(tc[0]), setLabel);
      out += `<td>${renderRuns(tc[0], record) || '&nbsp;'}</td>`;
    }
    out += '</tr>';
  }
  return out + '</tbody></table>';
}

/**
 * @param {string} documentXml  a compiled word/document.xml
 * @returns {DocxView}
 */
export function buildDocxView(documentXml) {
  const body = documentXml.match(/<w:body\b[^>]*>([\s\S]*)<\/w:body>/)?.[1] ?? documentXml;

  /** @type {DocSection[]} */
  const sections = [];
  let cur = { heading: 'Overview', tagNames: [] };
  sections.push(cur);
  const record = (name) => { if (!cur.tagNames.includes(name)) cur.tagNames.push(name); };

  /** @type {Record<string, string>} */
  const labels = {};
  const setLabel = (tag, label) => { if (label && !(tag in labels)) labels[tag] = label; };

  let html = '';
  // Match a whole table OR a paragraph. A table's inner <w:p> are consumed by the
  // table match (no nesting in these templates), so they aren't re-emitted as body
  // paragraphs.
  const blockRe = /<w:tbl\b[\s\S]*?<\/w:tbl>|<w:p\b[\s\S]*?<\/w:p>/g;
  for (const m of body.matchAll(blockRe)) {
    const block = m[0];
    if (block.startsWith('<w:tbl')) {
      html += renderTable(block, record, setLabel);
      continue;
    }
    const text = extractText(block);
    if (!text.trim()) continue;
    if (isHeading(text)) {
      cur = { heading: decodeEntities(text.trim()), tagNames: [] };
      sections.push(cur);
      html += `<h4 class="tpl-h">${text}</h4>`;
    } else {
      extractLabels(text, setLabel);
      html += `<p class="tpl-p">${renderRuns(block, record)}</p>`;
    }
  }

  return { previewHtml: html, sections, labels };
}
