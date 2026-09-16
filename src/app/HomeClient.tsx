'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import ProfileSelector, {
  ProfileAnswers,
  levelName,
  emptyAnswers,
  deriveProfile,
  isProfileComplete,
  answersToWire,
  wireToAnswers,
} from '@/components/ProfileSelector';
import {
  getAssessmentMeta,
  getAssessmentContent,
  saveAssessment,
  getProfile,
  saveProfile,
  SessionExpiredError,
  HttpError,
  XLSX_MIME,
} from '@/lib/asp-net';
import DocumentBuilder from '@/components/DocumentBuilder';
import exceptionData from '@/data/exception-map.json';
import traceabilityData from '@/data/traceability.json';
import tierMapData from '@/data/tier-map.json';
import manifestData from '@/data/template-manifest.json';
import { toFileNameStem } from '@/lib/file-naming.mjs';
import { apiUrl, assetUrl } from '@/lib/base-path';

interface ManifestEntry {
  form: 'docx' | 'xlsx' | false;
  examples: string[];
  /** File extension shared by this artifact's example files. */
  exampleExt?: 'docx' | 'xlsx';
}

const manifest = manifestData as Record<string, ManifestEntry>;

const TIER_COLORS: Record<number, { text: string; muted: string }> = {
  1: { text: '#3730A3', muted: '#6D5BD0' },
  2: { text: '#065F46', muted: '#0F766E' },
  3: { text: '#075985', muted: '#0284C7' },
  4: { text: '#7C2D12', muted: '#C2410C' },
  5: { text: '#78350F', muted: '#B45309' },
  6: { text: '#365314', muted: '#4D7C0F' },
};

function getFormUrl(id: string, name: string, ext: string): string {
  return assetUrl(`/templates/forms/${id}-${toFileNameStem(name)}-FORM.${ext}`);
}

function getExampleUrl(id: string, name: string, profile: string): string {
  const ext = manifest[id]?.exampleExt ?? 'docx';
  return assetUrl(`/templates/examples/${id}-${toFileNameStem(name)}-EXAMPLE-${profile}.${ext}`);
}

/**
 * Denotes an artifact's template format so the presence/absence of the
 * "✦ Build Document" action is self-explanatory: documents (.docx) can be
 * built in-app; spreadsheets (.xlsx) are downloaded and filled in Excel.
 * Renders nothing for artifacts without a template.
 */
function FormatBadge({ form }: { form?: 'docx' | 'xlsx' | false }) {
  if (form === 'docx') {
    return (
      <span
        title='Word document — fill it in-app with "Build Document," or download the template'
        className="text-xs bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1"
      >
        <svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
        </svg>
        Document
      </span>
    );
  }
  if (form === 'xlsx') {
    return (
      <span
        title="Excel spreadsheet — download and fill it in Excel"
        className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1"
      >
        <svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M3 15h18" />
          <path d="M9 3v18" />
          <path d="M15 3v18" />
        </svg>
        Spreadsheet
      </span>
    );
  }
  return null;
}

/**
 * Key shown above the Full Library list and both Assessment tabs (Build
 * Priority and By Question). Reuses the row badges so the marker a user sees
 * on each artifact is tied to how that artifact is obtained — documents are
 * built in-app then downloaded, whereas spreadsheets must be downloaded first
 * and filled in Excel.
 */
function FormatLegend({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-gray-500 bg-gray-50 border rounded-lg px-3 py-2.5 ${className}`}
      style={{ borderColor: 'var(--ui-border)' }}
    >
      <span className="inline-flex items-center gap-1.5">
        <FormatBadge form="docx" />
        <span>can be built on the site, then downloaded.</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <FormatBadge form="xlsx" />
        <span>must be downloaded first, then filled in Excel.</span>
      </span>
    </div>
  );
}

interface PSAPInfo {
  name: string;
  address: string;
  cityZip: string;
  director: string;
  directorPhone: string;
  directorEmail: string;
}

interface Artifact {
  id: string;
  name: string;
  type: string;
  phase: string;
  seqId: string;
  gate: boolean;
  classification: string;
}

interface Gap {
  id: string;
  rating: string;
  domain: string;
  category: string;
  artifacts: Artifact[];
}

interface ParseResult {
  psapInfo: PSAPInfo;
  gaps: Gap[];
  totalGaps: number;
  /** Questions rated YES / NOT APPLICABLE — not gaps, but their artifacts are
   *  worth surfacing as reference. Same shape as a gap. */
  covered: Gap[];
  totalCovered: number;
}

/** Rating → badge classes. The four gap colors match the pre-existing By-Question
 *  ternary verbatim; YES / NOT APPLICABLE add distinct non-gap styling. */
const RATING_BADGE: Record<string, string> = {
  'NO': 'bg-red-100 text-red-700',
  'PLANNED': 'bg-yellow-100 text-yellow-700',
  'IN PROGRESS': 'bg-sky-100 text-sky-700',
  'UNKNOWN': 'bg-gray-100 text-gray-600',
  'YES': 'bg-emerald-100 text-emerald-700',
  'NOT APPLICABLE': 'bg-slate-100 text-slate-600',
};
const ratingBadgeClass = (rating: string) => RATING_BADGE[rating] ?? 'bg-gray-100 text-gray-600';

const lv: Record<string, number> = { S: 1, M: 2, L: 3 };

/** Fallback when the builder is opened from the Full Library with no assessment
 *  uploaded — auto-fill fields simply start empty and are filled by hand. */
const EMPTY_PSAP: PSAPInfo = {
  name: '',
  address: '',
  cityZip: '',
  director: '',
  directorPhone: '',
  directorEmail: '',
};

export default function HomeClient() {
  const [result, setResult] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'setup' | 'assessment' | 'library'>('setup');
  const [builderArtifact, setBuilderArtifact] = useState<Artifact | null>(null);

  // Persistence-integration state.
  const [bootstrapping, setBootstrapping] = useState(true);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [answers, setAnswers] = useState<ProfileAnswers>(emptyAnswers());
  const [showProfileErrors, setShowProfileErrors] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Derived profile — recomputed from the raw answers; never persisted.
  const profile = useMemo(() => deriveProfile(answers), [answers]);

  /** Map an ArtifactData/persistence error to a user-facing message. */
  const describeError = useCallback((e: unknown): string => {
    if (e instanceof SessionExpiredError) return 'Session expired. Reopen the Artifact Library from Tools.';
    if (e instanceof HttpError) {
      if (e.status === 413) return 'File too large (250 KB max).';
      if (e.status === 415) return 'Only .xlsx files are accepted.';
      if (e.status === 400) return e.message || 'The request was rejected. Please check and try again.';
      if (e.status >= 500) return 'Could not save right now — your work is kept. Please try again.';
      return e.message || `Request failed (HTTP ${e.status}).`;
    }
    return 'Could not reach the server. Check your connection and try again.';
  }, []);

  /** Parse an .xlsx through the EXISTING parse-assessment endpoint. Returns the
   *  parsed result or null (with an error set). Does NOT persist. */
  const parseAssessment = useCallback(async (file: File): Promise<ParseResult | null> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(apiUrl('/api/parse-assessment'), { method: 'POST', body: formData });
      if (!response.ok) {
        if (response.status === 401) {
          setError('Your Artifact Library session has expired. Close and reopen it from Tools.');
          return null;
        }
        if (response.status === 503) {
          setError('The Artifact Library is temporarily unavailable.');
          return null;
        }
        const err = await response.json().catch(() => null);
        setError(err?.error ?? `Upload failed (HTTP ${response.status}). Please try again.`);
        return null;
      }
      return await response.json();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
      return null;
    }
  }, []);

  /** Handle a newly selected assessment file (first upload OR replace): parse and
   *  validate first; only on success reflect it in the UI and persist. On a parse
   *  failure any previously loaded assessment is left untouched. */
  const handleAssessmentFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    const parsed = await parseAssessment(file);
    if (!parsed) { setLoading(false); return; } // keep existing result/saved file unchanged
    setResult(parsed);
    setCurrentFileName(file.name);
    setActiveView('setup');
    try {
      const meta = await saveAssessment(file);
      setCurrentFileName(meta.fileName ?? file.name);
    } catch (e) {
      // Parsed OK but storage failed — keep the parsed result, surface the error.
      setError(describeError(e));
    }
    setLoading(false);
  }, [parseAssessment, describeError]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Clear the input so selecting the same file again still fires a change event.
    e.target.value = '';
    if (file) handleAssessmentFile(file);
  }, [handleAssessmentFile]);

  /** Continue to Assessment: validate q1–q7, persist the profile, then navigate. */
  const handleContinue = useCallback(async () => {
    if (!isProfileComplete(answers)) {
      setShowProfileErrors(true);
      setProfileError('Please answer all required questions (1–7) before continuing.');
      return;
    }
    setProfileError(null);
    setLoading(true);
    try {
      await saveProfile(answersToWire(answers));
      setActiveView('assessment');
    } catch (e) {
      setProfileError(describeError(e));
    } finally {
      setLoading(false);
    }
  }, [answers, describeError]);

  // On mount: detect a saved assessment. If present, load its bytes, parse them
  // through the existing endpoint, and hydrate the saved profile. A 401 shows the
  // session message; any other failure (e.g. standalone dev with no ASP.NET) falls
  // through to the normal first-use upload screen.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const meta = await getAssessmentMeta();
        if (cancelled) return;
        if (meta.exists) {
          setCurrentFileName(meta.fileName ?? 'assessment.xlsx');
          try {
            const { blob, fileName } = await getAssessmentContent();
            const file = new File([blob], meta.fileName ?? fileName, { type: XLSX_MIME });
            const parsed = await parseAssessment(file);
            if (!cancelled && parsed) setResult(parsed);
          } catch (e) {
            if (!cancelled) setError(describeError(e));
          }
          try {
            const wire = await getProfile();
            if (!cancelled && wire) setAnswers(wireToAnswers(wire));
          } catch (e) {
            // Only a session failure is worth surfacing; otherwise leave the profile blank.
            if (!cancelled && e instanceof SessionExpiredError) setError(describeError(e));
          }
        }
      } catch (e) {
        if (!cancelled) {
          if (e instanceof SessionExpiredError) {
            // 401 → session expired.
            setError(describeError(e));
          } else if (e instanceof HttpError && e.status === 404) {
            // No ASP.NET persistence backend (e.g. standalone dev) → first-use screen.
          } else if (e instanceof HttpError) {
            // 5xx / other HTTP error: surface it; do NOT masquerade as "no assessment".
            setError(
              e.status >= 500
                ? 'Could not load your saved assessment right now. Please try again.'
                : e.message || `Could not load your saved assessment (HTTP ${e.status}).`,
            );
          } else {
            // Network / unexpected failure: surface, don't pretend there's no assessment.
            setError('Could not reach the server. Check your connection and try again.');
          }
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => { cancelled = true; };
  }, [parseAssessment, describeError]);

  const gapsByDomain = result?.gaps.reduce((acc, gap) => {
    if (!acc[gap.domain]) acc[gap.domain] = [];
    acc[gap.domain].push(gap);
    return acc;
  }, {} as Record<string, Gap[]>);

  // The Reference tab mirrors By Question for the covered (YES / N/A) questions.
  const coveredByDomain = result?.covered.reduce((acc, q) => {
    if (!acc[q.domain]) acc[q.domain] = [];
    acc[q.domain].push(q);
    return acc;
  }, {} as Record<string, Gap[]>);

  const [activeTab, setActiveTab] = useState<'build' | 'questions' | 'reference'>('build');
  // By-Question rows collapse their action line; keyed per gap+artifact occurrence
  // so the same artifact under different questions toggles independently.
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const toggleRow = useCallback((key: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryType, setLibraryType] = useState('');

  const categoryToTier = useMemo(() => {
    const map = new Map<string, { tierNumber: number; tierName: string; tierPosition: number }>();
    for (const tier of tierMapData.tiers) {
      tier.categories.forEach((catId, index) => {
        map.set(catId, { tierNumber: tier.number, tierName: tier.name, tierPosition: index + 1 });
      });
    }
    return map;
  }, []);

  const getArtifactTier = useCallback((artifactId: string) => {
    const categories = (traceabilityData.artifactCategories as Record<string, string[]>)[artifactId] ?? [];
    let best = { tierNumber: 99, tierName: 'Uncategorized', tierPosition: 99 };
    for (const catId of categories) {
      const tier = categoryToTier.get(catId);
      if (
        tier &&
        (tier.tierNumber < best.tierNumber ||
          (tier.tierNumber === best.tierNumber && tier.tierPosition < best.tierPosition))
      ) {
        best = tier;
      }
    }
    return best;
  }, [categoryToTier]);

  const artifactBuildList = useMemo(() => {
    if (!result) return [];
    const map = new Map<string, { artifact: Artifact; gapIds: string[] }>();
    for (const gap of result.gaps) {
      for (const artifact of gap.artifacts) {
        if (!map.has(artifact.id)) map.set(artifact.id, { artifact, gapIds: [] });
        map.get(artifact.id)!.gapIds.push(gap.id);
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      const tierA = getArtifactTier(a.artifact.id);
      const tierB = getArtifactTier(b.artifact.id);
      if (tierA.tierNumber !== tierB.tierNumber) return tierA.tierNumber - tierB.tierNumber;
      if (tierA.tierPosition !== tierB.tierPosition) return tierA.tierPosition - tierB.tierPosition;
      if (a.artifact.gate !== b.artifact.gate) return a.artifact.gate ? -1 : 1;
      return a.artifact.seqId.localeCompare(b.artifact.seqId);
    });
  }, [result, getArtifactTier]);

  const artifactsByTier = useMemo(() => {
    const groups: Record<string, { tierName: string; tierNumber: number; items: typeof artifactBuildList }> = {};
    for (const item of artifactBuildList) {
      const { tierNumber, tierName } = getArtifactTier(item.artifact.id);
      const key = `Tier ${tierNumber}`;
      if (!groups[key]) groups[key] = { tierName, tierNumber, items: [] };
      groups[key].items.push(item);
    }
    return groups;
  }, [artifactBuildList, getArtifactTier]);

  // Artifact ids referenced by at least one gap question — drives the Full
  // Library "Gap" badge and the Reference tab's "Also a gap" overlap marker.
  const gapArtifactIds = useMemo(
    () => new Set(artifactBuildList.map(a => a.artifact.id)),
    [artifactBuildList],
  );

  // Reference-tab overlap: how many distinct artifacts surfaced by covered
  // (YES / N/A) questions also address an open gap. Varies per assessment.
  const referenceStats = useMemo(() => {
    const ids = new Set<string>();
    for (const q of result?.covered ?? []) for (const a of q.artifacts) ids.add(a.id);
    let overlap = 0;
    for (const id of ids) if (gapArtifactIds.has(id)) overlap++;
    return { total: ids.size, overlap };
  }, [result, gapArtifactIds]);

  const fullLibraryList = useMemo(() => {
    return Object.values(traceabilityData.artifactMap as Record<string, Artifact & { status: string }>)
      .map(artifact => ({ artifact, isGap: gapArtifactIds.has(artifact.id) }))
      .sort((a, b) => {
        const tierA = getArtifactTier(a.artifact.id);
        const tierB = getArtifactTier(b.artifact.id);
        if (tierA.tierNumber !== tierB.tierNumber) return tierA.tierNumber - tierB.tierNumber;
        if (tierA.tierPosition !== tierB.tierPosition) return tierA.tierPosition - tierB.tierPosition;
        if (a.artifact.gate !== b.artifact.gate) return a.artifact.gate ? -1 : 1;
        return a.artifact.seqId.localeCompare(b.artifact.seqId);
      });
  }, [gapArtifactIds, getArtifactTier]);

  const fullLibraryByTier = useMemo(() => {
    const groups: Record<string, { tierName: string; tierNumber: number; items: typeof fullLibraryList }> = {};
    for (const item of fullLibraryList) {
      const { tierNumber, tierName } = getArtifactTier(item.artifact.id);
      const key = `Tier ${tierNumber}`;
      if (!groups[key]) groups[key] = { tierName, tierNumber, items: [] };
      groups[key].items.push(item);
    }
    return groups;
  }, [fullLibraryList, getArtifactTier]);

  const exceptionMapById = useMemo(() => {
    const map = new Map<string, typeof exceptionData.artifacts[0]>();
    for (const entry of exceptionData.artifacts) map.set(entry.id, entry);
    return map;
  }, []);

  function getScaleBadges(artifactId: string, classification: string) {
    const entry = exceptionMapById.get(artifactId);
    const badges: React.ReactNode[] = [];
    if (entry) {
      if (
        entry.flags.includes('Technical footprint') &&
        lv[profile.technicalLevel] > lv[profile.baseline]
      )
        badges.push(
          <span key="tech" className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-medium">
            ↑ Technical · {levelName[profile.technicalLevel]}
          </span>
        );
      if (entry.flags.includes('Governance') && lv[profile.governanceLevel] > lv[profile.baseline])
        badges.push(
          <span key="gov" className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium">
            ↑ Governance · {levelName[profile.governanceLevel]}
          </span>
        );
      if (entry.flags.includes('Consolidated / multi-agency') && profile.consolidated)
        badges.push(
          <span key="consol" className="text-xs bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded font-medium">
            Multi-agency
          </span>
        );
      if (entry.flags.includes('Co-located / shared space') && profile.colocated)
        badges.push(
          <span key="coloc" className="text-xs bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-medium">
            Co-located
          </span>
        );
    }
    if (profile.cjis && classification?.includes('CJIS'))
      badges.push(
        <span key="cjis" className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium">
          CJIS
        </span>
      );
    return badges;
  }

  const libraryTypes = useMemo(
    () => Array.from(new Set(fullLibraryList.map(i => i.artifact.type))).filter(Boolean).sort(),
    [fullLibraryList]
  );

  const matchesLibraryFilter = useCallback(
    (artifact: Artifact) => {
      const q = librarySearch.trim().toLowerCase();
      if (libraryType && artifact.type !== libraryType) return false;
      if (q && !artifact.name.toLowerCase().includes(q) && !artifact.type.toLowerCase().includes(q)) return false;
      return true;
    },
    [librarySearch, libraryType]
  );

  const libraryMatchCount = useMemo(
    () => fullLibraryList.filter(i => matchesLibraryFilter(i.artifact)).length,
    [fullLibraryList, matchesLibraryFilter]
  );

  // Shared By-Question renderer for both the gap tab and the Reference tab.
  // Defined inside Home() and INVOKED as a function (like renderFullLibrary) so
  // it reuses closures with no new component boundary — rendering it as a JSX
  // element would remount the whole list on every expand/tab/profile change.
  // `crossRefIds` (optional) badges artifacts that also appear in another set
  // (the Reference tab passes the gap-artifact ids → "Also a gap").
  const renderQuestionGroups = (
    groups: Record<string, Gap[]> | undefined,
    keyPrefix: string,
    crossRefIds?: Set<string>,
    crossRefLabel?: string,
  ) => (
    <div>
      {groups &&
        Object.entries(groups).map(([domain, questions]) => (
          <div key={domain} className="mb-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {domain}
            </h3>
            <div className="space-y-1">
              {questions.map(q => (
                <div key={q.id} className="py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-mono text-xs text-gray-400 w-12 shrink-0">{q.id}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded shrink-0 ${ratingBadgeClass(q.rating)}`}
                    >
                      {q.rating}
                    </span>
                    <span className="text-gray-600">{q.category}</span>
                  </div>
                  {q.artifacts.length > 0 && (
                    <div className="ml-14 mt-1 space-y-2">
                      {q.artifacts.map(artifact => {
                        const form = manifest[artifact.id]?.form;
                        const hasExample = (manifest[artifact.id]?.examples ?? []).includes(
                          profile.baseline
                        );
                        const hasActions = Boolean(form || hasExample);
                        const rowKey = `${keyPrefix}${q.id}:${artifact.id}`;
                        const expanded = expandedRows.has(rowKey);
                        const alsoCrossRef = Boolean(crossRefIds?.has(artifact.id));
                        return (
                          <div key={artifact.id}>
                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              {hasActions ? (
                                <button
                                  type="button"
                                  onClick={() => toggleRow(rowKey)}
                                  aria-expanded={expanded}
                                  title={expanded ? 'Hide actions' : 'Show actions'}
                                  className="group inline-flex items-center gap-2 text-left"
                                >
                                  <span
                                    className={`inline-block text-gray-400 transition-transform group-hover:text-gray-600 ${
                                      expanded ? 'rotate-90' : ''
                                    }`}
                                  >
                                    →
                                  </span>
                                  <span className="font-medium text-gray-700 group-hover:text-gray-900">
                                    {artifact.name}
                                  </span>
                                </button>
                              ) : (
                                <>
                                  <span className="text-gray-300">→</span>
                                  <span className="font-medium text-gray-700">{artifact.name}</span>
                                </>
                              )}
                              <FormatBadge form={form} />
                              {artifact.gate && (
                                <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                                  Gate
                                </span>
                              )}
                              {alsoCrossRef && crossRefLabel && (
                                <span
                                  className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium"
                                  title="This artifact also addresses an open gap elsewhere in your assessment."
                                >
                                  {crossRefLabel}
                                </span>
                              )}
                            </div>
                            {hasActions && expanded && (
                              <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-xs ml-6 mt-1">
                                {form && (
                                  <>
                                    <a
                                      href={getFormUrl(artifact.id, artifact.name, form)}
                                      download
                                      className="font-medium"
                                      style={{ color: 'var(--ui-link)' }}
                                    >
                                      ↓ Download Template
                                    </a>
                                    {form === 'docx' && (
                                      <button
                                        onClick={() => setBuilderArtifact(artifact)}
                                        className="font-medium text-emerald-600 hover:text-emerald-800"
                                      >
                                        ✦ Build Document
                                      </button>
                                    )}
                                  </>
                                )}
                                {hasExample && (
                                  <a
                                    href={getExampleUrl(artifact.id, artifact.name, profile.baseline)}
                                    download
                                    className="font-medium"
                                    style={{ color: 'var(--ui-link)' }}
                                  >
                                    ↓ Example · {levelName[profile.baseline]}
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );

  const renderFullLibrary = () => {
    const groups = Object.entries(fullLibraryByTier)
      .map(
        ([tierKey, group]) =>
          [
            tierKey,
            { ...group, items: group.items.filter(({ artifact }) => matchesLibraryFilter(artifact)) },
          ] as const
      )
      .filter(([, group]) => group.items.length > 0);

    if (groups.length === 0) {
      return <p className="text-sm text-gray-400 text-center py-10">No artifacts match your filters.</p>;
    }

    return (
      <div>
        {groups.map(([tierKey, { tierName, tierNumber, items }]) => {
          const tc = TIER_COLORS[tierNumber];
          return (
            <div key={tierKey} className="mb-6 last:mb-0">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: tc?.text ?? '#4B5563' }}>
                  {tierKey}
                </h3>
                <span className="text-xs" style={{ color: tc?.muted ?? '#6B7280' }}>
                  · {tierName}
                </span>
                <span className="text-gray-400 text-xs">
                  — {items.length} artifact{items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-2">
                {items.map(({ artifact, isGap }) => (
                  <div
                    key={artifact.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">{artifact.name}</span>
                        <FormatBadge form={manifest[artifact.id]?.form} />
                        {artifact.gate && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                            Gate
                          </span>
                        )}
                        {isGap && (
                          <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">Gap</span>
                        )}
                        {getScaleBadges(artifact.id, artifact.classification).map((badge, i) => (
                          <span key={i}>{badge}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>{artifact.type}</span>
                      </div>
                      {(manifest[artifact.id]?.form || (manifest[artifact.id]?.examples ?? []).length > 0) && (
                        <div
                          className="flex items-center gap-4 mt-2 pt-2 border-t"
                          style={{ borderColor: 'var(--ui-border)' }}
                        >
                          {manifest[artifact.id]?.form && (
                            <>
                              <a
                                href={getFormUrl(
                                  artifact.id,
                                  artifact.name,
                                  manifest[artifact.id].form as string
                                )}
                                download
                                className="text-xs font-medium"
                                style={{ color: 'var(--ui-link)' }}
                              >
                                ↓ Download Template
                              </a>
                              {manifest[artifact.id]?.form === 'docx' && (
                                <button
                                  onClick={() => setBuilderArtifact(artifact)}
                                  className="text-xs font-medium text-emerald-600 hover:text-emerald-800"
                                >
                                  ✦ Build Document
                                </button>
                              )}
                            </>
                          )}
                          {(manifest[artifact.id]?.examples ?? []).map(p => (
                            <a
                              key={p}
                              href={getExampleUrl(artifact.id, artifact.name, p)}
                              download
                              className="text-xs font-medium"
                              style={{ color: 'var(--ui-link)' }}
                            >
                              ↓ Example · {levelName[p as keyof typeof levelName]}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <React.Fragment>
      <main className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">PSAP Artifact Library</h1>
            {result ? (
              <p className="text-gray-500 text-sm">{result.psapInfo.name}</p>
            ) : (
              <p className="text-gray-500 text-sm">Upload your completed assessment matrix to get started.</p>
            )}
          </div>

          {/* Top-level navigation */}
          <div className="flex gap-1 border-b mb-6" style={{ borderColor: 'var(--ui-border)' }}>
            {(['setup', 'assessment', 'library'] as const).map(view => {
              const isDisabled = view === 'assessment' && !result;
              const label = view === 'setup' ? 'Setup' : view === 'assessment' ? 'Assessment' : 'Full Library';
              return (
                <button
                  key={view}
                  onClick={() => {
                    if (isDisabled) return;
                    setActiveView(view);
                  }}
                  disabled={isDisabled}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    view === 'library' ? 'ml-auto' : ''
                  } ${
                    isDisabled
                      ? 'border-transparent text-gray-300 cursor-not-allowed'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  style={
                    activeView === view
                      ? { borderBottomColor: 'var(--ui-link)', color: 'var(--ui-link)', borderBottomWidth: 2 }
                      : {}
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Setup view */}
          {activeView === 'setup' && (
            <div className="space-y-6">
              {bootstrapping ? (
                <div
                  className="border rounded-lg p-12 text-center bg-white text-gray-500"
                  style={{ borderColor: 'var(--ui-border)' }}
                >
                  Loading your saved assessment…
                </div>
              ) : !result ? (
                /* First-use: the full upload box. */
                <div
                  className="relative border-2 border-dashed rounded-lg p-12 text-center transition-colors bg-white"
                  style={{ borderColor: 'var(--ui-border)' }}
                >
                  <input
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {loading ? (
                    <p className="text-gray-500">Parsing assessment matrix...</p>
                  ) : (
                    <>
                      <p className="text-gray-700 font-medium">Click to upload your assessment matrix</p>
                      <p className="text-gray-400 text-sm mt-1">.xlsx files only</p>
                    </>
                  )}
                </div>
              ) : (
                /* Assessment already saved: compact filename bar + Replace action. */
                <div
                  className="flex items-center justify-between gap-3 bg-white rounded-lg px-5 py-4"
                  style={{ border: '1px solid var(--ui-border)' }}
                >
                  <div className="min-w-0">
                    <span className="text-gray-400 text-xs uppercase tracking-wide">Current assessment</span>
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {currentFileName ?? 'assessment.xlsx'}
                    </p>
                  </div>
                  <label
                    className="relative shrink-0 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg cursor-pointer text-white transition-colors"
                    style={{ background: 'var(--ui-link)' }}
                  >
                    <input
                      type="file"
                      accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={handleFileChange}
                      disabled={loading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    {loading ? 'Working…' : 'Replace Assessment Matrix'}
                  </label>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              {result && (
                <>
                  {/* PSAP Info */}
                  <div className="bg-white rounded-lg p-6" style={{ border: '1px solid var(--ui-border)' }}>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">{result.psapInfo.name}</h2>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Director</span>
                        <p className="text-gray-700 font-medium">{result.psapInfo.director}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Email</span>
                        <p className="text-gray-700">{result.psapInfo.directorEmail}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Address</span>
                        <p className="text-gray-700">{result.psapInfo.address}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs uppercase tracking-wide">City / ZIP</span>
                        <p className="text-gray-700">{result.psapInfo.cityZip}</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Selector (controlled by raw answers) */}
                  <ProfileSelector answers={answers} onChange={setAnswers} showErrors={showProfileErrors} />
                  {profileError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {profileError}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button
                      onClick={handleContinue}
                      disabled={loading}
                      className="px-5 py-2.5 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
                      style={{ background: 'var(--ui-link)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--ui-link-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'var(--ui-link)')}
                    >
                      {loading ? 'Saving…' : 'Continue to Assessment →'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Assessment view */}
          {activeView === 'assessment' && result && (
            <div className="bg-white rounded-lg" style={{ border: '1px solid var(--ui-border)' }}>
              <div className="px-6 pt-6 pb-0">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Assessment Gaps</h2>
                <p className="text-gray-500 text-sm mb-4">
                  {result.totalGaps} questions rated NO, IN PROGRESS, PLANNED, or UNKNOWN —{' '}
                  {artifactBuildList.length} artifacts with gaps · {fullLibraryList.length} total
                </p>
                <div className="flex gap-1 border-b" style={{ borderColor: 'var(--ui-border)' }}>
                  {(['build', 'questions', 'reference'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                        activeTab === tab ? '' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      style={
                        activeTab === tab
                          ? { borderBottomColor: 'var(--ui-link)', color: 'var(--ui-link)', borderBottomWidth: 2 }
                          : {}
                      }
                    >
                      {{ build: 'Build Priority', questions: 'By Question', reference: 'Reference' }[tab]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <FormatLegend className="mb-4" />
                {activeTab === 'build' ? (
                  <div>
                    {Object.entries(artifactsByTier).map(([tierKey, { tierName, tierNumber, items }]) => {
                      const tc = TIER_COLORS[tierNumber];
                      return (
                        <div key={tierKey} className="mb-6 last:mb-0">
                          <div className="flex items-center gap-2 mb-3">
                            <h3
                              className="text-xs font-semibold uppercase tracking-wide"
                              style={{ color: tc?.text ?? '#4B5563' }}
                            >
                              {tierKey}
                            </h3>
                            <span className="text-xs" style={{ color: tc?.muted ?? '#6B7280' }}>
                              · {tierName}
                            </span>
                            <span className="text-xs text-gray-400">
                              — {items.length} artifact{items.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {items.map(({ artifact, gapIds }) => (
                              <div
                                key={artifact.id}
                                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium text-gray-900">{artifact.name}</span>
                                    <FormatBadge form={manifest[artifact.id]?.form} />
                                    {artifact.gate && (
                                      <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                                        Gate
                                      </span>
                                    )}
                                    {getScaleBadges(artifact.id, artifact.classification).map((badge, i) => (
                                      <span key={i}>{badge}</span>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                    <span>{artifact.type}</span>
                                    <span>·</span>
                                    <span>{gapIds.length} gap{gapIds.length !== 1 ? 's' : ''}</span>
                                  </div>
                                  {(manifest[artifact.id]?.form ||
                                    (manifest[artifact.id]?.examples ?? []).length > 0) && (
                                    <div
                                      className="flex items-center gap-4 mt-2 pt-2 border-t"
                                      style={{ borderColor: 'var(--ui-border)' }}
                                    >
                                      {manifest[artifact.id]?.form && (
                                        <>
                                          <a
                                            href={getFormUrl(
                                              artifact.id,
                                              artifact.name,
                                              manifest[artifact.id].form as string
                                            )}
                                            download
                                            className="text-xs font-medium"
                                            style={{ color: 'var(--ui-link)' }}
                                          >
                                            ↓ Download Template
                                          </a>
                                          {manifest[artifact.id]?.form === 'docx' && (
                                            <button
                                              onClick={() => setBuilderArtifact(artifact)}
                                              className="text-xs font-medium text-emerald-600 hover:text-emerald-800"
                                            >
                                              ✦ Build Document
                                            </button>
                                          )}
                                        </>
                                      )}
                                      {(manifest[artifact.id]?.examples ?? []).includes(profile.baseline) && (
                                        <a
                                          href={getExampleUrl(artifact.id, artifact.name, profile.baseline)}
                                          download
                                          className="text-xs font-medium"
                                          style={{ color: 'var(--ui-link)' }}
                                        >
                                          ↓ Worked Example ({levelName[profile.baseline]})
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : activeTab === 'questions' ? (
                  renderQuestionGroups(gapsByDomain, 'gap:')
                ) : result.totalCovered === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-10">
                    No questions were rated Yes or Not Applicable.
                  </p>
                ) : (
                  <div>
                    <div className="mb-4 space-y-1 text-sm text-gray-500">
                      <p>
                        {result.totalCovered} question{result.totalCovered !== 1 ? 's' : ''} rated Yes or Not
                        Applicable — reference material already in place or not required.
                      </p>
                      {referenceStats.overlap > 0 && (
                        <p>
                          {referenceStats.overlap} of {referenceStats.total} referenced artifact
                          {referenceStats.total !== 1 ? 's' : ''} also address an open gap (marked{' '}
                          <span className="text-red-600 font-medium">Also a gap</span>).
                        </p>
                      )}
                    </div>
                    {renderQuestionGroups(coveredByDomain, 'ref:', gapArtifactIds, 'Also a gap')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Library view — browse the full artifact library, no assessment required */}
          {activeView === 'library' && (
            <div className="bg-white rounded-lg" style={{ border: '1px solid var(--ui-border)' }}>
              <div className="px-6 pt-6 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Full Library</h2>
                <p className="text-gray-500 text-sm">
                  {librarySearch.trim() || libraryType ? (
                    `Showing ${libraryMatchCount} of ${fullLibraryList.length} artifacts.`
                  ) : (
                    <>
                      Browse all {fullLibraryList.length} artifacts.
                      {!result && (
                        <>
                          {' '}
                          <button
                            onClick={() => setActiveView('setup')}
                            className="font-medium hover:underline"
                            style={{ color: 'var(--ui-link)' }}
                          >
                            Upload an assessment
                          </button>{' '}
                          to see which apply to your PSAP and pre-fill them.
                        </>
                      )}
                    </>
                  )}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <input
                    type="search"
                    value={librarySearch}
                    onChange={e => setLibrarySearch(e.target.value)}
                    placeholder="Search by name or type…"
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-200"
                    style={{ border: '1px solid var(--ui-border)' }}
                  />
                  <select
                    value={libraryType}
                    onChange={e => setLibraryType(e.target.value)}
                    className="px-3 py-2 text-sm rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-200"
                    style={{ border: '1px solid var(--ui-border)' }}
                  >
                    <option value="">All types</option>
                    {libraryTypes.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <FormatLegend className="mt-4" />
              </div>
              <div className="px-6 pb-6">{renderFullLibrary()}</div>
            </div>
          )}
        </div>
      </main>

      {builderArtifact && (
        <DocumentBuilder
          artifactId={builderArtifact.id}
          artifactName={builderArtifact.name}
          psapInfo={result?.psapInfo ?? EMPTY_PSAP}
          onClose={() => setBuilderArtifact(null)}
        />
      )}
    </React.Fragment>
  );
}
