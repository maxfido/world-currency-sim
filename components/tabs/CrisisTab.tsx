'use client';
import { useResultsStore } from '@/store/results';
import { COUNTRY_KEYS } from '@/lib/simulation/types';
import { COUNTRIES } from '@/lib/simulation/countries';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts';

const COLORS = ['#2C4A6B', '#B45309', '#065F46', '#7C3AED', '#DC2626', '#0891B2', '#D97706', '#4B5563'];

export default function CrisisTab() {
  const { results } = useResultsStore();
  if (!results) return null;

  const { periods, summary } = results;
  const sampled = periods.filter((_, i) => i % 3 === 0);

  // All crisis events
  const allCrises = periods.flatMap(p => p.crisisEvents);

  // Leverage over time
  const levData = sampled.map(p => ({
    t: p.t,
    ...Object.fromEntries(COUNTRY_KEYS.map(k => [k, +Math.min(20, p.countries[k].leverage).toFixed(2)])),
  }));

  // Net worth over time
  const nwData = sampled.map(p => ({
    t: p.t,
    ...Object.fromEntries(COUNTRY_KEYS.map(k => [k, +p.countries[k].netWorth.toFixed(3)])),
  }));

  // Crisis frequency by country
  const crisisFreq = COUNTRY_KEYS.map(k => ({
    country: k,
    name: COUNTRIES[k].name,
    count: allCrises.filter(e => e.country === k).length,
    perYear: (summary.crisisFrequency[k] * 12).toFixed(2),
    avgSeverity: (() => {
      const evts = allCrises.filter(e => e.country === k);
      return evts.length > 0 ? (evts.reduce((s, e) => s + e.severity, 0) / evts.length).toFixed(2) : '—';
    })(),
  }));

  return (
    <div className="p-5 space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Tile label="Total Crisis Events" value={`${summary.totalCrises}`} warn={summary.totalCrises > 10} />
        <Tile label="Most Crisis-Prone" value={
          crisisFreq.sort((a, b) => b.count - a.count)[0]?.country ?? '—'
        } sub={`${crisisFreq[0]?.count ?? 0} events`} />
        <Tile label="Most Stable" value={
          [...crisisFreq].sort((a, b) => a.count - b.count)[0]?.country ?? '—'
        } sub="Fewest events" />
      </div>

      {/* Crisis timeline */}
      <div>
        <Label>Crisis Timeline (all 240 periods)</Label>
        <div className="border border-[#D1D5DB] rounded p-3 bg-white overflow-x-auto">
          <svg width="100%" height={COUNTRY_KEYS.length * 24 + 24} viewBox={`0 0 600 ${COUNTRY_KEYS.length * 24 + 24}`}>
            {/* Axis */}
            <line x1={60} y1={COUNTRY_KEYS.length * 24 + 8} x2={580} y2={COUNTRY_KEYS.length * 24 + 8} stroke="#D1D5DB" strokeWidth={1} />
            {[0, 60, 120, 180, 240].map(t => (
              <g key={t}>
                <text x={60 + (t / 240) * 520} y={COUNTRY_KEYS.length * 24 + 20} fontSize={8} fill="#9CA3AF" textAnchor="middle">{t}</text>
              </g>
            ))}
            {/* Rows */}
            {COUNTRY_KEYS.map((k, i) => {
              const y = i * 24 + 12;
              const crises = allCrises.filter(e => e.country === k);
              return (
                <g key={k}>
                  <text x={4} y={y + 4} fontSize={8} fill="#6B7280" fontWeight={600}>{k}</text>
                  <line x1={60} y1={y} x2={580} y2={y} stroke="#F3F4F0" strokeWidth={8} />
                  {crises.map((ev, j) => {
                    const cx = 60 + (ev.period / 240) * 520;
                    const r = 3 + ev.severity * 5;
                    const col = ev.type === 'banking' ? '#DC2626' : ev.type === 'currency' ? '#B45309' : '#7C3AED';
                    return (
                      <circle key={j} cx={cx} cy={y} r={r} fill={col} opacity={0.7}>
                        <title>{`${k} t=${ev.period}: ${ev.type}, severity=${ev.severity.toFixed(2)}`}</title>
                      </circle>
                    );
                  })}
                </g>
              );
            })}
          </svg>
          <div className="flex gap-4 mt-2">
            {[['banking', '#DC2626'], ['currency', '#B45309'], ['debt', '#7C3AED']].map(([t, c]) => (
              <span key={t} className="flex items-center gap-1 text-[9px] text-[#6B7280]">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: c }} />
                {t}
              </span>
            ))}
            <span className="text-[9px] text-[#9CA3AF] italic ml-2">Circle size ∝ severity</span>
          </div>
        </div>
      </div>

      {/* Frequency table */}
      <div>
        <Label>Crisis Frequency by Country</Label>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#D1D5DB]">
              <th className="text-left py-1.5 pr-3 text-[#6B7280] font-medium">Country</th>
              <th className="text-right py-1.5 px-2 text-[#6B7280] font-medium">Total Events</th>
              <th className="text-right py-1.5 px-2 text-[#6B7280] font-medium">Per Year</th>
              <th className="text-right py-1.5 px-2 text-[#6B7280] font-medium">Avg. Severity</th>
            </tr>
          </thead>
          <tbody>
            {COUNTRY_KEYS.map(k => {
              const row = crisisFreq.find(r => r.country === k)!;
              return (
                <tr key={k} className="border-b border-[#F3F4F0] hover:bg-[#F9FAF8]">
                  <td className="py-1.5 pr-3 font-medium">{row.name}</td>
                  <td className={`mono text-right px-2 ${row.count > 5 ? 'text-red-600' : ''}`}>{row.count}</td>
                  <td className="mono text-right px-2">{row.perYear}</td>
                  <td className="mono text-right px-2">{row.avgSeverity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Banking leverage */}
      <div>
        <Label>Banking Leverage (x) — Fisher Debt-Deflation Channel</Label>
        <div className="border border-[#D1D5DB] rounded p-3 bg-white">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={levData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#F3F4F0" />
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={32} />
              <Tooltip contentStyle={{ fontSize: 10 }} />
              <ReferenceLine y={12} stroke="#DC2626" strokeDasharray="3 3" label={{ value: 'Crisis threshold', fontSize: 9, fill: '#DC2626' }} />
              {COUNTRY_KEYS.map((k, i) => (
                <Line key={k} dataKey={k} stroke={COLORS[i]} dot={false} strokeWidth={1.2} name={COUNTRIES[k].name} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
            {COUNTRY_KEYS.map((k, i) => (
              <span key={k} className="flex items-center gap-1 text-[9px] text-[#6B7280]">
                <span style={{ width: 10, height: 2, background: COLORS[i], display: 'inline-block', borderRadius: 1 }} />
                {COUNTRIES[k].name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Net worth */}
      <div>
        <Label>Banking Sector Net Worth (index)</Label>
        <div className="border border-[#D1D5DB] rounded p-3 bg-white">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={nwData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#F3F4F0" />
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={36} />
              <Tooltip contentStyle={{ fontSize: 10 }} />
              <ReferenceLine y={1} stroke="#D1D5DB" strokeDasharray="3 3" />
              <ReferenceLine y={0.4} stroke="#DC2626" strokeDasharray="2 2" label={{ value: 'Crisis floor', fontSize: 9, fill: '#DC2626' }} />
              {COUNTRY_KEYS.map((k, i) => (
                <Line key={k} dataKey={k} stroke={COLORS[i]} dot={false} strokeWidth={1.2} name={COUNTRIES[k].name} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value, sub, warn }: { label: string; value: string; sub?: string; warn?: boolean }) {
  return (
    <div className={`border rounded px-4 py-3 ${warn ? 'border-red-200 bg-red-50' : 'border-[#D1D5DB] bg-white'}`}>
      <div className="text-[10px] uppercase tracking-widest text-[#6B7280] font-semibold">{label}</div>
      <div className={`mono text-2xl font-light mt-1 ${warn ? 'text-red-600' : 'text-[#1A1A1A]'}`}>{value}</div>
      {sub && <div className="text-[10px] text-[#9CA3AF] mt-0.5">{sub}</div>}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] mb-2">{children}</div>;
}
