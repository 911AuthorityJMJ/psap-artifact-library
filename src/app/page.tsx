'use client';

import React, { useState, useMemo, useCallback } from 'react';
import ProfileSelector, { ProfileState, levelName } from '@/components/ProfileSelector';
import DocumentBuilder from '@/components/DocumentBuilder';
import exceptionData from '@/data/exception-map.json';
import traceabilityData from '@/data/traceability.json';
import tierMapData from '@/data/tier-map.json';
import manifestData from '@/data/template-manifest.json';

const manifest = manifestData as Record<string, { form: 'docx' | 'xlsx' | false; examples: string[] }>;

const TIER_COLORS: Record<number, { text: string; muted: string }> = {
  1: { text: '#3730A3', muted: '#6D5BD0' },
  2: { text: '#065F46', muted: '#0F766E' },
  3: { text: '#075985', muted: '#0284C7' },
  4: { text: '#7C2D12', muted: '#C2410C' },
  5: { text: '#78350F', muted: '#B45309' },
  6: { text: '#365314', muted: '#4D7C0F' },
};

function toFileNameStem(name: string): string {
  return name
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

function getFormUrl(id: string, name: string, ext: string): string {
  return `/templates/forms/${id}-${toFileNameStem(name)}-FORM.${ext}`;
}

function getExampleUrl(id: string, name: string, profile: string): string {
  return `/templates/examples/${id}-${toFileNameStem(name)}-EXAMPLE-${profile}.docx`;
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
}

const lv: Record<string, number> = { S: 1, M: 2, L: 3 };

export default function Home() {
  const [result, setResult] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'setup' | 'assessment'>('setup');
  const [builderArtifact, setBuilderArtifact] = useState<Artifact | null>(null);

  async function handleUpload(file: File) {
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/parse-assessment', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Upload failed');
      }
      setResult(await response.json());
    }
    catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    }
    finally {
      setLoading(false);
    }
  }
  
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }
  
  const gapsByDomain = result?.gaps.reduce((acc, gap) => {
    if (!acc[gap.domain]) acc[gap.domain] = [];
    acc[gap.domain].push(gap);
    return acc;
  }, {} as Record<string, Gap[]>);
  
  const [activeTab, setActiveTab] = useState<'build' | 'library' | 'questions'>('build');
  
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
      if (tier && (tier.tierNumber < best.tierNumber ||
        (tier.tierNumber === best.tierNumber && tier.tierPosition < best.tierPosition))) {
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
  
  const fullLibraryList = useMemo(() => {
    const gapIds = new Set(artifactBuildList.map(a => a.artifact.id));
    return Object.values(traceabilityData.artifactMap as Record<string, Artifact & { status: string }>)
      .map(artifact => ({ artifact, isGap: gapIds.has(artifact.id) }))
      .sort((a, b) => {
        const tierA = getArtifactTier(a.artifact.id);
        const tierB = getArtifactTier(b.artifact.id);
        if (tierA.tierNumber !== tierB.tierNumber) return tierA.tierNumber - tierB.tierNumber;
        if (tierA.tierPosition !== tierB.tierPosition) return tierA.tierPosition - tierB.tierPosition;
        if (a.artifact.gate !== b.artifact.gate) return a.artifact.gate ? -1 : 1;
        return a.artifact.seqId.localeCompare(b.artifact.seqId);
      });
  }, [artifactBuildList, getArtifactTier]);

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
  
  const [profile, setProfile] = useState<ProfileState>({
    baseline: 'S', technicalLevel: 'S', governanceLevel: 'S',
    cjis: false, consolidated: false, colocated: false,
  });

  const handleProfileChange = useCallback((p: ProfileState) => setProfile(p), []);
  
  const exceptionMapById = useMemo(() => {
    const map = new Map<string, typeof exceptionData.artifacts[0]>();
    for (const entry of exceptionData.artifacts) map.set(entry.id, entry);
    return map;
  }, []);
  
  function getScaleBadges(artifactId: string, classification: string) {
    const entry = exceptionMapById.get(artifactId);
    const badges: React.ReactNode[] = [];
    if (entry) {
      if (entry.flags.includes('Technical footprint') && lv[profile.technicalLevel] > lv[profile.baseline])
        badges.push(<span key="tech" className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-medium">↑ Technical · {levelName[profile.technicalLevel]}</span>);
      if (entry.flags.includes('Governance') && lv[profile.governanceLevel] > lv[profile.baseline])
        badges.push(<span key="gov" className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium">↑ Governance · {levelName[profile.governanceLevel]}</span>);
      if (entry.flags.includes('Consolidated / multi-agency') && profile.consolidated)
        badges.push(<span key="consol" className="text-xs bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded font-medium">Multi-agency</span>);
      if (entry.flags.includes('Co-located / shared space') && profile.colocated)
        badges.push(<span key="coloc" className="text-xs bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-medium">Co-located</span>);
    }
    if (profile.cjis && classification?.includes('CJIS'))
      badges.push(<span key="cjis" className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium">CJIS</span>);
    return badges;
  }
  
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
            {(['setup', 'assessment'] as const).map(view => (
              <button
                key={view}
                onClick={() => { if (view === 'assessment' && !result) return; setActiveView(view); }}
                disabled={view === 'assessment' && !result}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
                  activeView === view
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : view === 'assessment' && !result
                    ? 'border-transparent text-gray-300 cursor-not-allowed'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                style={activeView === view ? { borderBottomColor: 'var(--ui-link)', color: 'var(--ui-link)', borderBottomWidth: 2 } : {}}
              >
                {view === 'setup' ? 'Setup' : 'Assessment'}
              </button>
            ))}
          </div>
          
          {/* Setup view */}
          {activeView === 'setup' && (
            <div className="space-y-6">
              
              {/* Upload area */}
              <div className="relative border-2 border-dashed rounded-lg p-12 text-center transition-colors bg-white" style={{ borderColor: 'var(--ui-border)' }}>
                <input
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {loading ? (
                  <p className="text-gray-500">Parsing assessment matrix...</p>
                ) : result ? (
                    <>
                      <p className="text-gray-700 font-medium">Upload a different assessment matrix</p>
                      <p className="text-gray-400 text-sm mt-1">.xlsx files only</p>
                    </>
                  ) : (
                      <>
                        <p className="text-gray-700 font-medium">Click to upload your assessment matrix</p>
                        <p className="text-gray-400 text-sm mt-1">.xlsx files only</p>
                  </>
                )}
              </div>
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
                  
                  {/* Profile Selector */}
                  <ProfileSelector onChange={handleProfileChange} />
                  <div className="flex justify-end">
                    <button
                      onClick={() => setActiveView('assessment')}
                      className="px-5 py-2.5 text-white text-sm font-medium rounded-lg transition-colors"
                      style={{ background: 'var(--ui-link)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--ui-link-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'var(--ui-link)')}
                    >
                      Continue to Assessment →
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
                  {result.totalGaps} questions rated NO, PLANNED, or UNKNOWN —{' '}
                  {artifactBuildList.length} artifacts with gaps · {fullLibraryList.length} total
                </p>
                <div className="flex gap-1 border-b" style={{ borderColor: 'var(--ui-border)' }}>
                  {(['build', 'questions', 'library'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                        tab === 'library' ? 'ml-auto' : ''
                      } ${
                        activeTab === tab ? '' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      style={activeTab === tab ? { borderBottomColor: 'var(--ui-link)', color: 'var(--ui-link)', borderBottomWidth: 2 } : {}}
                    >
                      {tab === 'build' ? 'Build Priority' : tab === 'library' ? 'Full Library' : 'By Question'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-6">
                {activeTab === 'build' ? (
                  <div>
                    {Object.entries(artifactsByTier).map(([tierKey, { tierName, tierNumber, items }]) => {
                      const tc = TIER_COLORS[tierNumber];
                      return (
                      <div key={tierKey} className="mb-6 last:mb-0">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-xs font-semibold uppercase tracking-wide"
                              style={{ color: tc?.text ?? '#4B5563' }}>
                            {tierKey}
                          </h3>
                          <span className="text-xs" style={{ color: tc?.muted ?? '#6B7280' }}>· {tierName}</span>
                          <span className="text-xs text-gray-400">
                            — {items.length} artifact{items.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {items.map(({ artifact, gapIds }) => (
                            <div key={artifact.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium text-gray-900">{artifact.name}</span>
                                  {artifact.gate && (
                                    <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">Gate</span>
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
                                {(manifest[artifact.id]?.form || (manifest[artifact.id]?.examples ?? []).length > 0) && (
                                  <div className="flex items-center gap-4 mt-2 pt-2 border-t" style={{ borderColor: 'var(--ui-border)' }}>
                                    {manifest[artifact.id]?.form && (
                                      <>
                                        <a href={getFormUrl(artifact.id, artifact.name, manifest[artifact.id].form as string)} download
                                          className="text-xs font-medium" style={{ color: 'var(--ui-link)' }}>
                                          ↓ Blank Form
                                        </a>
                                        <button
                                          onClick={() => setBuilderArtifact(artifact)}
                                          className="text-xs font-medium text-emerald-600 hover:text-emerald-800">
                                          ✦ Build Document
                                        </button>
                                      </>
                                    )}
                                    {(manifest[artifact.id]?.examples ?? []).includes(profile.baseline) && (
                                      <a href={getExampleUrl(artifact.id, artifact.name, profile.baseline)} download
                                        className="text-xs font-medium" style={{ color: 'var(--ui-link)' }}>
                                        ↓ Worked Example ({levelName[profile.baseline]})
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-gray-300 font-mono shrink-0">{artifact.id}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                ) : activeTab === 'library' ? (
                    <div>
                      {Object.entries(fullLibraryByTier).map(([tierKey, { tierName, tierNumber, items }]) => {
                        const tc = TIER_COLORS[tierNumber];
                        return (
                        <div key={tierKey} className="mb-6 last:mb-0">
                          <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wide"
                                style={{ color: tc?.text ?? '#4B5563' }}>
                              {tierKey}
                            </h3>
                            <span className="text-xs" style={{ color: tc?.muted ?? '#6B7280' }}>· {tierName}</span>
                            <span className="text-gray-400 text-xs">
                              — {items.length} artifact{items.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {items.map(({ artifact, isGap }) => (
                              <div key={artifact.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium text-gray-900">{artifact.name}</span>
                                    {artifact.gate && (
                                      <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">Gate</span>
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
                                    <div className="flex items-center gap-4 mt-2 pt-2 border-t" style={{ borderColor: 'var(--ui-border)' }}>
                                      {manifest[artifact.id]?.form && (
                                        <>
                                          <a href={getFormUrl(artifact.id, artifact.name, manifest[artifact.id].form as string)} download
                                            className="text-xs font-medium" style={{ color: 'var(--ui-link)' }}>
                                            ↓ Blank Form
                                          </a>
                                          <button
                                            onClick={() => setBuilderArtifact(artifact)}
                                            className="text-xs font-medium text-emerald-600 hover:text-emerald-800">
                                            ✦ Build Document
                                          </button>
                                        </>
                                      )}
                                      {(manifest[artifact.id]?.examples ?? []).map(p => (
                                        <a key={p} href={getExampleUrl(artifact.id, artifact.name, p)} download
                                          className="text-xs font-medium" style={{ color: 'var(--ui-link)' }}>
                                          ↓ Example · {levelName[p as keyof typeof levelName]}
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs text-gray-300 font-mono shrink-0">{artifact.id}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                      <div>
                        {gapsByDomain && Object.entries(gapsByDomain).map(([domain, gaps]) => (
                          <div key={domain} className="mb-5">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{domain}</h3>
                            <div className="space-y-1">
                              {gaps.map(gap => (
                                <div key={gap.id} className="py-2 border-b border-gray-50 last:border-0">
                                  <div className="flex items-center gap-3 text-sm">
                                    <span className="font-mono text-xs text-gray-400 w-12 shrink-0">{gap.id}</span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded shrink-0 ${
                                      gap.rating === 'NO' ? 'bg-red-100 text-red-700'
                                      : gap.rating === 'PLANNED' ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-gray-100 text-gray-600'
                                      }`}>{gap.rating}</span>
                                    <span className="text-gray-600">{gap.category}</span>
                                  </div>
                                  {gap.artifacts.length > 0 && (
                                    <div className="ml-14 mt-1 space-y-0.5">
                                      {gap.artifacts.map(artifact => (
                                        <div key={artifact.id} className="flex items-center gap-2 text-xs">
                                          <span className="text-gray-300">→</span>
                                          <span className="font-medium text-gray-700">{artifact.name}</span>
                                          {artifact.gate && (
                                            <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">Gate</span>
                                          )}
                                          {manifest[artifact.id]?.form && (
                                            <a href={getFormUrl(artifact.id, artifact.name, manifest[artifact.id].form as string)} download
                                              className="ml-1 text-xs" style={{ color: 'var(--ui-link)' }}>↓</a>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      {builderArtifact && result && (
        <DocumentBuilder
          artifactId={builderArtifact.id}
          artifactName={builderArtifact.name}
          psapInfo={result.psapInfo}
          onClose={() => setBuilderArtifact(null)}
        />
      )}
    </React.Fragment>
  );
}