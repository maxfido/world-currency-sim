'use client';
import { useScenarioStore } from '@/store/scenario';
import { ASSUMPTIONS } from '@/lib/assumptions';

const ARCHITECTURES = [
  { id: 'fiat' as const, label: 'Fiat Baseline', desc: 'Discretionary central banks, independent monetary policy' },
  { id: 'fixed' as const, label: 'Fixed Supply', desc: 'No new issuance; deflationary by design (Bitcoin model)' },
  { id: 'programmatic' as const, label: 'Programmatic', desc: '4%/yr NGDP-targeting rule; algorithmic expansion' },
  { id: 'reserve' as const, label: 'Reserve-Backed', desc: 'Partial fiat reserve; managed exchange rate' },
];

const DISTRIBUTIONS = [
  { id: 'gdp' as const, label: 'GDP-Proportional', desc: 'Allocated by economic output share' },
  { id: 'population' as const, label: 'Population-Proportional', desc: 'Allocated by headcount' },
  { id: 'egalitarian' as const, label: 'Egalitarian', desc: 'Equal shares across all regions' },
  { id: 'empirical' as const, label: 'Empirical (BTC)', desc: 'Concentrated in early-adopter economies' },
];

const SLIDER_PARAMS = [
  { key: 'piStar' as const, label: 'Inflation Target', symbol: 'π*', unit: '%', min: 0, max: 8, step: 0.5 },
  { key: 'rStarWorld' as const, label: 'Neutral Real Rate', symbol: 'r*', unit: '%', min: 0, max: 5, step: 0.25 },
  { key: 'lambda' as const, label: 'Expectations Speed', symbol: 'λ', unit: '', min: 0.1, max: 0.9, step: 0.05 },
  { key: 'phiPi' as const, label: 'Taylor φπ', symbol: 'φπ', unit: '', min: 1.0, max: 3.0, step: 0.25 },
  { key: 'theta' as const, label: 'Trade Elasticity', symbol: 'θ', unit: '', min: 2, max: 8, step: 0.5 },
  { key: 'crisisThreshold' as const, label: 'Crisis Leverage', symbol: 'λ̄', unit: 'x', min: 8, max: 20, step: 1 },
];

export default function LeftRail() {
  const { architecture, distribution, params, seed, setArchitecture, setDistribution, setParam, setSeed } = useScenarioStore();

  return (
    <aside className="w-[280px] shrink-0 border-r border-[#D1D5DB] overflow-y-auto bg-[#FAFAF7] flex flex-col">
      {/* Architecture */}
      <section className="px-4 pt-4 pb-3 border-b border-[#E5E7EB]">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] mb-2">
          Monetary Architecture
        </div>
        <div className="space-y-1">
          {ARCHITECTURES.map(a => (
            <button
              key={a.id}
              onClick={() => setArchitecture(a.id)}
              className={`w-full text-left rounded px-3 py-2 transition-colors ${
                architecture === a.id
                  ? 'bg-[#2C4A6B] text-white'
                  : 'hover:bg-[#F3F4F0] text-[#1A1A1A]'
              }`}
            >
              <div className="text-xs font-medium">{a.label}</div>
              <div className={`text-[10px] mt-0.5 leading-tight ${architecture === a.id ? 'text-blue-200' : 'text-[#6B7280]'}`}>
                {a.desc}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Initial Distribution */}
      <section className="px-4 pt-3 pb-3 border-b border-[#E5E7EB]">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] mb-2">
          Initial Currency Distribution
        </div>
        <div className="space-y-1">
          {DISTRIBUTIONS.map(d => (
            <button
              key={d.id}
              onClick={() => setDistribution(d.id)}
              className={`w-full text-left rounded px-3 py-2 transition-colors ${
                distribution === d.id
                  ? 'bg-[#F0F4F8] border border-[#2C4A6B] text-[#2C4A6B]'
                  : 'hover:bg-[#F3F4F0] text-[#1A1A1A]'
              }`}
            >
              <div className="text-xs font-medium">{d.label}</div>
              <div className="text-[10px] text-[#6B7280] mt-0.5 leading-tight">{d.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Parameter Sliders */}
      <section className="px-4 pt-3 pb-3 border-b border-[#E5E7EB]">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] mb-3">
          Parameters
        </div>
        <div className="space-y-4">
          {SLIDER_PARAMS.map(p => {
            const val = params[p.key] as number;
            return (
              <div key={p.key}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs text-[#1A1A1A]">{p.label}</span>
                  <span className="mono text-xs font-medium text-[#2C4A6B]">
                    {val.toFixed(p.step < 1 ? (p.step < 0.1 ? 2 : 1) : 0)}{p.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  value={val}
                  onChange={e => setParam(p.key, parseFloat(e.target.value))}
                />
                <div className="flex justify-between text-[9px] text-[#9CA3AF] mt-0.5">
                  <span>{p.min}{p.unit}</span>
                  <span>{p.max}{p.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Seed */}
      <section className="px-4 pt-3 pb-4">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] mb-2">
          RNG Seed
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            value={seed}
            onChange={e => setSeed(parseInt(e.target.value) || 0)}
            className="flex-1 mono text-xs px-2 py-1 border border-[#D1D5DB] rounded bg-white text-[#1A1A1A] focus:outline-none focus:border-[#2C4A6B]"
          />
          <button
            onClick={() => setSeed(Math.floor(Math.random() * 99999))}
            className="text-xs px-2 py-1 border border-[#D1D5DB] rounded hover:bg-[#F3F4F0] text-[#6B7280]"
          >
            ↻
          </button>
        </div>
        <p className="text-[10px] text-[#9CA3AF] mt-1.5 leading-tight">
          Fixed seed ensures exact reproducibility across runs.
        </p>
      </section>
    </aside>
  );
}
