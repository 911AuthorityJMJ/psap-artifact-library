'use client';

import type { ProfileWire } from '@/lib/asp-net';

export type Level = 'S' | 'M' | 'L';

const levelValue: Record<Level, number> = { S: 1, M: 2, L: 3 };
export const levelName: Record<Level, string> = { S: 'Small', M: 'Medium', L: 'Large' };

const isLevel = (v: unknown): v is Level => v === 'S' || v === 'M' || v === 'L';

/** Derived profile the rest of the app consumes for badges / example scaling. */
export interface ProfileState {
  baseline: Level;
  technicalLevel: Level;
  governanceLevel: Level;
  cjis: boolean;
  consolidated: boolean;
  colocated: boolean;
}

/**
 * Raw ProfileSelector source answers (q1..q8b). '' / null represent an
 * unselected required control; these are what get persisted. The derived
 * S/M/L ProfileState is recomputed from them and never stored.
 */
export interface ProfileAnswers {
  itManagement: Level | '';            // q1
  cybersecurityOwnership: Level | '';  // q2
  operationalCapability: Level | '';   // q3
  dispatcherFteBand: Level | '';       // q4
  callHandlingEnvironment: Level | '';  // q5
  governanceMaturity: Level | '';      // q6
  accessesCjis: boolean | null;        // q7  (null = unselected)
  consolidated: boolean;               // q8a
  colocated: boolean;                  // q8b
}

export function emptyAnswers(): ProfileAnswers {
  return {
    itManagement: '',
    cybersecurityOwnership: '',
    operationalCapability: '',
    dispatcherFteBand: '',
    callHandlingEnvironment: '',
    governanceMaturity: '',
    accessesCjis: null,
    consolidated: false,
    colocated: false,
  };
}

/** All required selects (q1..q7) are answered. Checkboxes q8a/q8b are always valid. */
export function isProfileComplete(a: ProfileAnswers): boolean {
  return (
    isLevel(a.itManagement) &&
    isLevel(a.cybersecurityOwnership) &&
    isLevel(a.operationalCapability) &&
    isLevel(a.dispatcherFteBand) &&
    isLevel(a.callHandlingEnvironment) &&
    isLevel(a.governanceMaturity) &&
    (a.accessesCjis === true || a.accessesCjis === false)
  );
}

/** Recompute the derived profile. Tolerant of unselected values (used pre-completion). */
export function deriveProfile(a: ProfileAnswers): ProfileState {
  const present = [a.itManagement, a.cybersecurityOwnership, a.operationalCapability].filter(isLevel) as Level[];
  const baseline: Level = present.length
    ? present.reduce((min, cur) => (levelValue[cur] < levelValue[min] ? cur : min))
    : 'S';
  const technicalLevel: Level =
    isLevel(a.callHandlingEnvironment) && levelValue[a.callHandlingEnvironment] > levelValue[baseline]
      ? a.callHandlingEnvironment
      : baseline;
  const governanceLevel: Level =
    isLevel(a.governanceMaturity) && levelValue[a.governanceMaturity] > levelValue[baseline]
      ? a.governanceMaturity
      : baseline;
  return {
    baseline,
    technicalLevel,
    governanceLevel,
    cjis: a.accessesCjis === true,
    consolidated: a.consolidated,
    colocated: a.colocated,
  };
}

/** Map UI answers → PascalCase wire DTO. Call only when isProfileComplete is true. */
export function answersToWire(a: ProfileAnswers): ProfileWire {
  return {
    ItManagement: a.itManagement || '',
    CybersecurityOwnership: a.cybersecurityOwnership || '',
    OperationalCapability: a.operationalCapability || '',
    DispatcherFteBand: a.dispatcherFteBand || '',
    CallHandlingEnvironment: a.callHandlingEnvironment || '',
    GovernanceMaturity: a.governanceMaturity || '',
    AccessesCjis: a.accessesCjis === true,
    Consolidated: a.consolidated,
    Colocated: a.colocated,
  };
}

/** Map a persisted wire DTO → UI answers, blanking any value not in the current option set. */
export function wireToAnswers(w: ProfileWire): ProfileAnswers {
  const lvl = (v: unknown): Level | '' => (isLevel(v) ? v : '');
  return {
    itManagement: lvl(w.ItManagement),
    cybersecurityOwnership: lvl(w.CybersecurityOwnership),
    operationalCapability: lvl(w.OperationalCapability),
    dispatcherFteBand: lvl(w.DispatcherFteBand),
    callHandlingEnvironment: lvl(w.CallHandlingEnvironment),
    governanceMaturity: lvl(w.GovernanceMaturity),
    accessesCjis: typeof w.AccessesCjis === 'boolean' ? w.AccessesCjis : null,
    consolidated: !!w.Consolidated,
    colocated: !!w.Colocated,
  };
}

interface Props {
  answers: ProfileAnswers;
  onChange: (answers: ProfileAnswers) => void;
  /** When true, highlight required controls left unselected. */
  showErrors?: boolean;
}

interface RowProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  invalid?: boolean;
  muted?: boolean;
}

/** A select row with a leading blank "Select…" option. */
function SelectRow({ label, value, onChange, options, invalid, muted }: RowProps) {
  return (
    <div className="flex items-center gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className={`flex-1 text-sm ${muted ? 'text-gray-400' : 'text-gray-700'}`}>{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`text-sm border rounded-lg px-3 py-2 bg-white min-w-[260px] ${
          invalid ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200'
        }`}
      >
        <option value="">Select…</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function ProfileSelector({ answers, onChange, showErrors = false }: Props) {
  const set = (patch: Partial<ProfileAnswers>) => onChange({ ...answers, ...patch });

  const baselineComplete =
    isLevel(answers.itManagement) &&
    isLevel(answers.cybersecurityOwnership) &&
    isLevel(answers.operationalCapability);
  const baseline = baselineComplete ? deriveProfile(answers).baseline : null;

  const levelOpts = (opts: { value: string; label: string }[]) => opts;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">PSAP Profile</h2>
      <p className="text-gray-500 text-sm mb-5">
        Calibrate the artifact library to your center&apos;s capabilities. The baseline tracks your lowest
        capability — exceptions only scale up from there. All questions 1–7 are required.
      </p>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Baseline drivers — the lowest of these three sets your profile
      </p>
      <div className="mb-4">
        <SelectRow label="1. Who handles IT day to day?" value={answers.itManagement}
          onChange={v => set({ itManagement: v as Level | '' })} invalid={showErrors && !isLevel(answers.itManagement)}
          options={levelOpts([
            { value: 'S', label: 'Vendor-managed or no dedicated IT' },
            { value: 'M', label: 'Shared county / city IT' },
            { value: 'L', label: 'IT staff dedicated to the PSAP' },
          ])} />
        <SelectRow label="2. Who owns cybersecurity tasks?" value={answers.cybersecurityOwnership}
          onChange={v => set({ cybersecurityOwnership: v as Level | '' })} invalid={showErrors && !isLevel(answers.cybersecurityOwnership)}
          options={levelOpts([
            { value: 'S', label: 'No one formally assigned' },
            { value: 'M', label: 'Part-time or shared duty' },
            { value: 'L', label: 'A named, dedicated role' },
          ])} />
        <SelectRow label="3. What can you operate and keep running?" value={answers.operationalCapability}
          onChange={v => set({ operationalCapability: v as Level | '' })} invalid={showErrors && !isLevel(answers.operationalCapability)}
          options={levelOpts([
            { value: 'S', label: 'Manual: checklists, spreadsheets' },
            { value: 'M', label: 'Some tooling: endpoint, logging, MFA' },
            { value: 'L', label: 'Centralized: SIEM, MDM, monitoring' },
          ])} />
      </div>

      <div className="mb-5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
        <span className="text-xs text-blue-500 font-semibold uppercase tracking-wide">Baseline profile — </span>
        {baseline ? (
          <>
            <span className="text-sm font-semibold text-blue-700">{levelName[baseline]}</span>
            <span className="text-xs text-blue-400 ml-2">(set by your weakest capability answer)</span>
          </>
        ) : (
          <span className="text-sm text-blue-400">answer questions 1–3 to set your baseline</span>
        )}
      </div>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Confirming &amp; exception drivers
      </p>
      <div className="mb-5">
        <SelectRow label="4. Full-time-equivalent dispatchers?" value={answers.dispatcherFteBand}
          onChange={v => set({ dispatcherFteBand: v as Level | '' })} invalid={showErrors && !isLevel(answers.dispatcherFteBand)}
          options={levelOpts([
            { value: 'S', label: '1–5' },
            { value: 'M', label: '6–25' },
            { value: 'L', label: '25+' },
          ])} />
        <SelectRow label="5. Call-handling environment?" value={answers.callHandlingEnvironment}
          onChange={v => set({ callHandlingEnvironment: v as Level | '' })} invalid={showErrors && !isLevel(answers.callHandlingEnvironment)}
          options={levelOpts([
            { value: 'S', label: 'Single CAD + ESInet, single carrier' },
            { value: 'M', label: 'Some redundancy, mixed cloud / on-prem' },
            { value: 'L', label: 'Full NG911, multiple integrations' },
          ])} />
        <SelectRow label="6. Governance in place today?" value={answers.governanceMaturity}
          onChange={v => set({ governanceMaturity: v as Level | '' })} invalid={showErrors && !isLevel(answers.governanceMaturity)}
          options={levelOpts([
            { value: 'S', label: 'Few or no written policies' },
            { value: 'M', label: 'Some, inconsistently maintained' },
            { value: 'L', label: 'Maintained set with review cycles' },
          ])} />
      </div>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Flags — independent of profile
      </p>
      <div className="flex items-center gap-4 py-2.5 border-b border-gray-100">
        <span className="flex-1 text-sm text-gray-700">7. Access CJIS data (via IDACS)?</span>
        <select
          value={answers.accessesCjis === null ? '' : answers.accessesCjis ? 'yes' : 'no'}
          onChange={e => set({ accessesCjis: e.target.value === '' ? null : e.target.value === 'yes' })}
          className={`text-sm border rounded-lg px-3 py-2 bg-white min-w-[260px] ${
            showErrors && answers.accessesCjis === null ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200'
          }`}
        >
          <option value="">Select…</option>
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>
      <div className="py-3">
        <p className="text-sm text-gray-700 mb-2">8. Structure?</p>
        <div className="space-y-2 ml-1">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={answers.consolidated} onChange={e => set({ consolidated: e.target.checked })} className="w-4 h-4 rounded" />
            Consolidated / multi-agency
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={answers.colocated} onChange={e => set({ colocated: e.target.checked })} className="w-4 h-4 rounded" />
            Co-located with another agency
          </label>
        </div>
      </div>
    </div>
  );
}
