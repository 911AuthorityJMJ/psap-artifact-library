'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { ScalarField, LoopField, LoopSubField, TemplateSection } from '@/lib/builder-types';

interface PSAPInfo {
  name: string;
  director: string;
  directorEmail: string;
  address: string;
  cityZip: string;
  directorPhone: string;
}

interface Props {
  artifactId: string;
  artifactName: string;
  psapInfo: PSAPInfo;
  onClose: () => void;
}

type RowValues = Record<string, string>;
type Values = Record<string, string | RowValues[]>;

const inputCls =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

function emptyRow(loop: LoopField): RowValues {
  const row: RowValues = {};
  for (const sf of loop.fields) row[sf.name] = '';
  return row;
}

export default function DocumentBuilder({ artifactId, artifactName, psapInfo, onClose }: Props) {
  const [sections, setSections] = useState<TemplateSection[]>([]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [values, setValues] = useState<Values>({});
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/template-fields/${artifactId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setLoadError(data.error); return; }
        const secs = (data.sections ?? []) as TemplateSection[];
        setSections(secs);
        setPreviewHtml(data.previewHtml ?? '');

        const initial: Values = {};
        for (const sec of secs) {
          for (const f of sec.fields) {
            if (f.kind === 'loop') {
              initial[f.name] = [emptyRow(f)];
            } else {
              let v = f.autoFill ? (psapInfo[f.autoFill] ?? '') : '';
              // Repeated [#] cells disambiguate to version, version2, … — all
              // of them mean a document version, so all default to 1.0.
              if (/^version\d*$/.test(f.name) && !v) v = '1.0';
              initial[f.name] = v;
            }
          }
        }
        setValues(initial);
        setLoaded(true);
      })
      .catch(() => setLoadError('Failed to load template fields'));
  }, [artifactId, psapInfo]);

  // Map every slot's data-field → its label / kind, so the preview can render a
  // readable placeholder when empty and know which loop a sub-field belongs to.
  const slotInfo = useMemo(() => {
    const idx = new Map<string, { label: string; loopName?: string }>();
    for (const sec of sections) {
      for (const f of sec.fields) {
        if (f.kind === 'scalar') idx.set(f.name, { label: f.label });
        else for (const sf of f.fields) idx.set(sf.name, { label: sf.label, loopName: f.name });
      }
    }
    return idx;
  }, [sections]);

  // Inject the preview HTML once (imperatively, so React doesn't fight the
  // per-slot text updates we do below).
  useEffect(() => {
    if (previewRef.current) previewRef.current.innerHTML = previewHtml;
  }, [previewHtml]);

  // Paint every slot from the current values whenever they change.
  useEffect(() => {
    const root = previewRef.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>('.tpl-slot[data-field]').forEach(el => {
      const name = el.dataset.field as string;
      const info = slotInfo.get(name);
      let text = '';
      if (info?.loopName) {
        const rows = values[info.loopName] as RowValues[] | undefined;
        text = rows?.[0]?.[name] ?? ''; // preview binds the loop's first row
      } else {
        text = (values[name] as string) ?? '';
      }
      if (text) {
        el.textContent = text;
        el.classList.add('filled');
        el.classList.remove('empty');
      } else {
        el.textContent = `[${info?.label ?? name}]`;
        el.classList.add('empty');
        el.classList.remove('filled');
      }
    });
  }, [values, previewHtml, slotInfo]);

  // Highlight every place this field lands (a value can appear in several spots),
  // and scroll the first into view.
  const highlight = useCallback((name: string) => {
    const root = previewRef.current;
    if (!root) return;
    root.querySelectorAll('.tpl-slot.active').forEach(el => el.classList.remove('active'));
    const targets = root.querySelectorAll<HTMLElement>(`.tpl-slot[data-field="${name}"]`);
    targets.forEach(el => el.classList.add('active'));
    targets[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const setScalar = useCallback((name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const setCell = useCallback((loop: string, rowIdx: number, sub: string, value: string) => {
    setValues(prev => {
      const rows = [...((prev[loop] as RowValues[]) ?? [])];
      rows[rowIdx] = { ...rows[rowIdx], [sub]: value };
      return { ...prev, [loop]: rows };
    });
  }, []);

  const addRow = useCallback((loop: LoopField) => {
    setValues(prev => {
      const rows = [...((prev[loop.name] as RowValues[]) ?? [])];
      if (loop.maxRows && rows.length >= loop.maxRows) return prev;
      return { ...prev, [loop.name]: [...rows, emptyRow(loop)] };
    });
  }, []);

  const removeRow = useCallback((loop: string, rowIdx: number) => {
    setValues(prev => {
      const rows = [...((prev[loop] as RowValues[]) ?? [])];
      rows.splice(rowIdx, 1);
      return { ...prev, [loop]: rows };
    });
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setGenerateError(null);
    try {
      const response = await fetch(`/api/generate-document/${artifactId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: values }),
      });
      if (!response.ok) {
        // The error body may not be JSON (proxy / gateway pages) — don't let
        // parsing it eat the real failure.
        const err = await response.json().catch(() => null);
        setGenerateError(err?.error ?? `Generation failed (HTTP ${response.status}). Please try again.`);
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = response.headers.get('Content-Disposition') ?? '';
      const match = disposition.match(/filename="([^"]+)"/);
      a.download = match?.[1] ?? `${artifactId}-COMPLETED.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setGenerateError('Could not reach the server — check your connection and try again.');
    } finally {
      setGenerating(false);
    }
  }

  const hasFields = sections.some(s => s.fields.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Build Document</h2>
            <p className="text-sm text-gray-500 mt-0.5">{artifactName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body: form (left) + live preview (right) */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row">
          {/* Form pane */}
          <div className="md:w-[42%] md:border-r border-gray-100 overflow-y-auto px-6 py-4">
            {loadError ? (
              <p className="text-red-600 text-sm">{loadError}</p>
            ) : !loaded ? (
              <p className="text-gray-400 text-sm">Loading fields…</p>
            ) : !hasFields ? (
              <p className="text-gray-400 text-sm">
                This template has no fillable fields — download it directly from the library instead.
              </p>
            ) : (
              <div className="space-y-5">
                {sections.map(sec => (
                  <div key={sec.heading}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      {sec.heading}
                    </p>
                    <div className="space-y-3">
                      {sec.fields.map(f =>
                        f.kind === 'scalar' ? (
                          <div key={f.name}>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {f.label}
                              {f.autoFill && (values[f.name] as string) ? (
                                <span className="ml-2 text-[10px] font-normal text-blue-500">from your assessment</span>
                              ) : null}
                            </label>
                            <ScalarInput
                              field={f}
                              value={(values[f.name] as string) ?? ''}
                              onChange={v => setScalar(f.name, v)}
                              onFocus={() => highlight(f.name)}
                            />
                          </div>
                        ) : (
                          <LoopGroup
                            key={f.name}
                            loop={f}
                            rows={(values[f.name] as RowValues[]) ?? []}
                            onCell={(i, sub, v) => setCell(f.name, i, sub, v)}
                            onAdd={() => addRow(f)}
                            onRemove={i => removeRow(f.name, i)}
                            onFocusSub={sub => highlight(sub)}
                          />
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview pane */}
          <div className="hidden md:flex md:w-[58%] flex-col bg-gray-50 min-h-0">
            <div className="px-5 pt-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wide shrink-0">
              Live preview
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="bg-white rounded-lg border border-gray-200 px-8 py-7 shadow-sm">
                <div ref={previewRef} className="tpl-preview" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {hasFields && !loadError && (
          <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between gap-3">
            {generateError ? (
              <p className="text-xs text-red-600" role="alert">{generateError}</p>
            ) : (
              <p className="text-xs text-gray-400">
                Highlighted text shows where each field lands. Downloads a filled .docx.
              </p>
            )}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="shrink-0 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {generating ? 'Generating…' : 'Download'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** One repeatable loop section (add/remove rows of typed sub-fields). */
function LoopGroup({
  loop,
  rows,
  onCell,
  onAdd,
  onRemove,
  onFocusSub,
}: {
  loop: LoopField;
  rows: RowValues[];
  onCell: (rowIdx: number, sub: string, value: string) => void;
  onAdd: () => void;
  onRemove: (rowIdx: number) => void;
  onFocusSub: (sub: string) => void;
}) {
  const atMax = loop.maxRows != null && rows.length >= loop.maxRows;
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-500 mb-1">{loop.label}</p>
      <div className="space-y-3">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400">Row {rowIdx + 1}</span>
              <button
                type="button"
                onClick={() => onRemove(rowIdx)}
                className="text-xs text-gray-400 hover:text-red-600"
              >
                Remove
              </button>
            </div>
            <div className="space-y-2">
              {loop.fields.map(sf => (
                <div key={sf.name}>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">{sf.label}</label>
                  <ScalarInput
                    field={sf}
                    value={row[sf.name] ?? ''}
                    onChange={v => onCell(rowIdx, sf.name, v)}
                    onFocus={() => onFocusSub(sf.name)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={atMax}
        className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-300"
      >
        + Add row{atMax ? ` (max ${loop.maxRows})` : ''}
      </button>
    </div>
  );
}

/** Renders one value input by field type. `select` uses a datalist so curated
 *  options are suggested while still allowing a free-text override. */
function ScalarInput({
  field,
  value,
  onChange,
  onFocus,
}: {
  field: ScalarField | LoopSubField;
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
}) {
  if (field.type === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={field.placeholder ?? ''}
        rows={2}
        className={inputCls}
      />
    );
  }
  if (field.type === 'select' && field.options?.length) {
    const listId = `dl-${field.name}`;
    return (
      <>
        <input
          list={listId}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={onFocus}
          placeholder={field.placeholder ?? 'Select or type…'}
          className={inputCls}
        />
        <datalist id={listId}>
          {field.options.map(opt => (
            <option key={opt} value={opt} />
          ))}
        </datalist>
      </>
    );
  }
  return (
    <input
      type={field.type === 'date' ? 'date' : 'text'}
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={onFocus}
      placeholder={field.placeholder ?? ''}
      className={inputCls}
    />
  );
}
