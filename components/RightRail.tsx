'use client';
import { useState } from 'react';
import { useResultsStore } from '@/store/results';
import { useScenarioStore } from '@/store/scenario';
import { EQUATIONS } from '@/lib/equations';
import { ASSUMPTIONS } from '@/lib/assumptions';
import { CITATIONS } from '@/lib/citations';
import { renderKatex } from '@/lib/katexHelper';

type Panel = 'equations' | 'assumptions' | 'citations' | 'model' | 'about';

export default function RightRail() {
  const [open, setOpen] = useState<Panel>('equations');
  const { focusedTab } = useResultsStore();
  const { params } = useScenarioStore();

  const relevantEqs = EQUATIONS.filter(e => e.tabs.includes(focusedTab));

  return (
    <aside className="w-[300px] shrink-0 border-l border-[#D1D5DB] overflow-y-auto bg-[#FAFAF7] text-xs flex flex-col">
      {/* Panel headers */}
      <div className="flex border-b border-[#D1D5DB] shrink-0">
        {(['equations', 'assumptions', 'citations'] as Panel[]).map(p => (
          <button
            key={p}
            onClick={() => setOpen(p)}
            className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
              open === p ? 'text-[#2C4A6B] border-b-2 border-[#2C4A6B]' : 'text-[#9CA3AF] hover:text-[#6B7280]'
            }`}
          >
            {p === 'equations' ? 'Equations' : p === 'assumptions' ? 'Assumptions' : 'Citations'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {open === 'equations' && (
          <div className="p-4 space-y-5">
            <p className="text-[10px] text-[#9CA3AF] italic">
              Showing equations relevant to the <span className="font-medium text-[#6B7280]">{focusedTab}</span> tab.
            </p>
            {relevantEqs.map(eq => (
              <div key={eq.id} className="space-y-1.5">
                <div className="font-semibold text-[#1A1A1A]">{eq.name}</div>
                <div
                  className="bg-[#F3F4F0] rounded px-3 py-2 overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: renderKatex(eq.latex) }}
                />
                <p className="text-[10px] text-[#6B7280] leading-relaxed">{eq.description}</p>
              </div>
            ))}
            {relevantEqs.length === 0 && (
              <p className="text-[#9CA3AF] text-[10px]">No equations mapped to this tab.</p>
            )}
          </div>
        )}

        {open === 'assumptions' && (
          <div className="p-4 space-y-3">
            {ASSUMPTIONS.map(a => {
              const paramKey = a.id as keyof typeof params;
              const current = params[paramKey] as number ?? a.defaultValue;
              const diverged = Math.abs(current - a.defaultValue) > a.step * 0.5;
              return (
                <div key={a.id} className={`rounded px-3 py-2 ${diverged ? 'bg-amber-50 border border-amber-200' : 'bg-[#F3F4F0]'}`}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium text-[#1A1A1A]">{a.label}</span>
                    <span className="mono font-semibold text-[#2C4A6B]">
                      {current.toFixed(a.step < 1 ? (a.step < 0.1 ? 2 : 1) : 0)}{a.unit}
                    </span>
                  </div>
                  {diverged && (
                    <div className="text-[9px] text-amber-700 mt-0.5">
                      default: {a.defaultValue}{a.unit}
                    </div>
                  )}
                  <div className="text-[10px] text-[#6B7280] mt-1 leading-relaxed">{a.description}</div>
                  <div className="text-[9px] text-[#9CA3AF] mt-1 italic">{a.citation}</div>
                </div>
              );
            })}
          </div>
        )}

        {open === 'citations' && (
          <div className="p-4 space-y-3">
            {CITATIONS.map(c => (
              <div key={c.id} className="space-y-0.5">
                <div className="font-medium text-[#1A1A1A] leading-snug">{c.title}</div>
                <div className="text-[10px] text-[#6B7280]">{c.authors} ({c.year})</div>
                <div className="text-[10px] text-[#9CA3AF] italic leading-relaxed">{c.journal}</div>
                {c.note && <div className="text-[10px] text-[#6B7280]">{c.note}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
