'use client';

import { useEffect, useState } from 'react';

type Level = 'S' | 'M' | 'L';

const levelValue: Record<Level, number> = { S: 1, M: 2, L: 3 };
export const levelName: Record<Level, string> = { S: 'Small', M: 'Medium', L: 'Large' };

export interface ProfileState {
  baseline: Level;
  technicalLevel: Level;
  governanceLevel: Level;
  cjis: boolean;
  consolidated: boolean;
  colocated: boolean;
}

interface Props {
  onChange: (profile: ProfileState) => void;
}

interface RowProps {
  label: string;
  value: Level;
  onChange: (v: Level) => void;
  options: { value: string; label: string }[];
  muted?: boolean;
}

function ProfileRow({ label, value, onChange, options, muted }: RowProps) {
  return (
    <div className="flex items-center gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className={`flex-1 text-sm ${muted ? 'text-gray-400' : 'text-gray-700'}`}>{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value as Level)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white min-w-[260px]"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function ProfileSelector({ onChange }: Props) {
  const [q1, setQ1] = useState<Level>('S');
  const [q2, setQ2] = useState<Level>('S');
  const [q3, setQ3] = useState<Level>('S');
  const [q4, setQ4] = useState<Level>('S');
  const [q5, setQ5] = useState<Level>('S');
  const [q6, setQ6] = useState<Level>('S');
  const [q7, setQ7] = useState(false);
  const [q8a, setQ8a] = useState(false);
  const [q8b, setQ8b] = useState(false);

  useEffect(() => {
    const baseline = ([q1, q2, q3] as Level[]).reduce((min, cur) =>
      levelValue[cur] < levelValue[min] ? cur : min
    );
    const technicalLevel: Level = levelValue[q5] > levelValue[baseline] ? q5 : baseline;
    const governanceLevel: Level = levelValue[q6] > levelValue[baseline] ? q6 : baseline;
    onChange({ baseline, technicalLevel, governanceLevel, cjis: q7, consolidated: q8a, colocated: q8b });
  }, [q1, q2, q3, q4, q5, q6, q7, q8a, q8b, onChange]);

  const baseline = ([q1, q2, q3] as Level[]).reduce((min, cur) =>
    levelValue[cur] < levelValue[min] ? cur : min
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">PSAP Profile</h2>
      <p className="text-gray-500 text-sm mb-5">
        Calibrate the artifact library to your center&apos;s capabilities. The baseline tracks your lowest
        capability — exceptions only scale up from there.
      </p>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Baseline drivers — the lowest of these three sets your profile
      </p>
      <div className="mb-4">
        <ProfileRow label="1. Who handles IT day to day?" value={q1} onChange={setQ1} options={[
          { value: 'S', label: 'Vendor-managed or no dedicated IT' },
          { value: 'M', label: 'Shared county / city IT' },
          { value: 'L', label: 'IT staff dedicated to the PSAP' },
        ]} />
        <ProfileRow label="2. Who owns cybersecurity tasks?" value={q2} onChange={setQ2} options={[
          { value: 'S', label: 'No one formally assigned' },
          { value: 'M', label: 'Part-time or shared duty' },
          { value: 'L', label: 'A named, dedicated role' },
        ]} />
        <ProfileRow label="3. What can you operate and keep running?" value={q3} onChange={setQ3} options={[
          { value: 'S', label: 'Manual: checklists, spreadsheets' },
          { value: 'M', label: 'Some tooling: endpoint, logging, MFA' },
          { value: 'L', label: 'Centralized: SIEM, MDM, monitoring' },
        ]} />
      </div>

      <div className="mb-5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
        <span className="text-xs text-blue-500 font-semibold uppercase tracking-wide">Baseline profile — </span>
        <span className="text-sm font-semibold text-blue-700">{levelName[baseline]}</span>
        <span className="text-xs text-blue-400 ml-2">
          (set by your weakest capability answer)
        </span>
      </div>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Confirming &amp; exception drivers
      </p>
      <div className="mb-5">
        <ProfileRow label="4. Full-time-equivalent dispatchers? (annotation only)" value={q4} onChange={setQ4} muted options={[
          { value: 'S', label: '1–5' },
          { value: 'M', label: '6–25' },
          { value: 'L', label: '25+' },
        ]} />
        <ProfileRow label="5. Call-handling environment?" value={q5} onChange={setQ5} options={[
          { value: 'S', label: 'Single CAD + ESInet, single carrier' },
          { value: 'M', label: 'Some redundancy, mixed cloud / on-prem' },
          { value: 'L', label: 'Full NG911, multiple integrations' },
        ]} />
        <ProfileRow label="6. Governance in place today?" value={q6} onChange={setQ6} options={[
          { value: 'S', label: 'Few or no written policies' },
          { value: 'M', label: 'Some, inconsistently maintained' },
          { value: 'L', label: 'Maintained set with review cycles' },
        ]} />
      </div>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Flags — independent of profile
      </p>
      <div className="flex items-center gap-4 py-2.5 border-b border-gray-100">
        <span className="flex-1 text-sm text-gray-700">7. Access CJIS data (via IDACS)?</span>
        <select
          value={q7 ? 'yes' : 'no'}
          onChange={e => setQ7(e.target.value === 'yes')}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white min-w-[260px]"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>
      <div className="py-3">
        <p className="text-sm text-gray-700 mb-2">8. Structure?</p>
        <div className="space-y-2 ml-1">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={q8a} onChange={e => setQ8a(e.target.checked)} className="w-4 h-4 rounded" />
            Consolidated / multi-agency
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={q8b} onChange={e => setQ8b(e.target.checked)} className="w-4 h-4 rounded" />
            Co-located with another agency
          </label>
        </div>
      </div>
    </div>
  );
}