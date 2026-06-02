'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FieldDef } from '@/app/api/template-fields/[id]/route';

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

const PSAP_AUTO_FILL: Record<string, keyof PSAPInfo> = {
  agencyName:    'name',
  directorName:  'director',
  directorEmail: 'directorEmail',
};

export default function DocumentBuilder({ artifactId, artifactName, psapInfo, onClose }: Props) {
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch(`/api/template-fields/${artifactId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setLoadError(data.error); return; }
        setFields(data.fields);
        const initial: Record<string, string> = {};
        for (const f of data.fields as FieldDef[]) {
          const psapKey = PSAP_AUTO_FILL[f.name];
          initial[f.name] = psapKey ? (psapInfo[psapKey] ?? '') : '';
        }
        // Default version to 1.0
        if ('version' in initial && !initial.version) initial.version = '1.0';
        setValues(initial);
      })
      .catch(() => setLoadError('Failed to load template fields'));
  }, [artifactId, psapInfo]);

  const autoFilledNames = new Set(
    fields.filter(f => PSAP_AUTO_FILL[f.name]).map(f => f.name)
  );

  const handleChange = useCallback((name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const response = await fetch(`/api/generate-document/${artifactId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: values }),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.error ?? 'Generation failed');
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
    } finally {
      setGenerating(false);
    }
  }

  const manualFields = fields.filter(f => !autoFilledNames.has(f.name));
  const prefilled = fields.filter(f => autoFilledNames.has(f.name));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between gap-3">
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
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loadError ? (
            <p className="text-red-600 text-sm">{loadError}</p>
          ) : fields.length === 0 ? (
            <p className="text-gray-400 text-sm">Loading fields…</p>
          ) : (
            <div className="space-y-5">
              {/* Pre-filled from PSAP profile */}
              {prefilled.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Pre-filled from your PSAP profile
                  </p>
                  <div className="space-y-2">
                    {prefilled.map(f => (
                      <div key={f.name} className="flex items-center gap-3 py-1.5 px-3 bg-blue-50 rounded-lg">
                        <span className="text-xs text-blue-500 w-32 shrink-0">{f.label}</span>
                        <span className="text-sm text-blue-900 font-medium truncate">{values[f.name]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual fields */}
              {manualFields.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Complete these fields
                  </p>
                  <div className="space-y-3">
                    {manualFields.map(f => (
                      <div key={f.name}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {f.label}
                        </label>
                        <input
                          type={f.type === 'date' ? 'date' : 'text'}
                          value={values[f.name] ?? ''}
                          onChange={e => handleChange(f.name, e.target.value)}
                          placeholder={f.placeholder ?? ''}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {fields.length > 0 && !loadError && (
          <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              Downloads a filled .docx — any remaining [brackets] are for manual editing in Word.
            </p>
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
