'use client';
import { useResultsStore } from '@/store/results';
import { COUNTRY_KEYS } from '@/lib/simulation/types';
import { COUNTRIES } from '@/lib/simulation/countries';
import { lorenzPoints } from '@/lib/simulation/distribution';
import { growthIncidence } from '@/lib/metrics/inequality';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar, Cell
} from 'recharts';

const COLORS = ['#2C4A6B', '#B45309', '#065F46', '#7C3AED', '#DC2626', '#0891B2', '#D97706', '#4B5563'];

export default function DistributionTab() {
  const { results } = useResultsStore();
  if (!results) return null;

  const { periods, summary } = results;
  const first = periods[0];
  const last = periods[periods.length - 1];

  // Gini over time
  const sampled = periods.filter((_, i) => i % 3 === 0);
  const giniData = sampled.map(p => ({
    t: p.t,
    ...Object.fromEntries(COUNTRY_KEYS.map(k => [k, +p.countries[k].gini.toFixed(3)])),
    global: +(COUNTRY_KEYS.reduce((s, k) => s + p.countries[k].gini * COUNTRIES[k].popShare, 0)).toFixed(3),
  }));

  // Lorenz curves at t=0 and t=240 for each country
  const lorenzData = COUNTRY_KEYS.map(k => {
    const pts0 = lorenzPoints(first.countries[k].logMean, first.countries[k].logSigma);
    const pts1 = lorenzPoints(last.countries[k].logMean, last.countries[k].logSigma);
    return { key: k, pts0, pts1 };
  });

  // Growth incidence for selected countries
  const gicUS = growthIncidence(
    first.countries['US'].logMean, first.countries['US'].logSigma,
    last.countries['US'].logMean, last.countries['US'].logSigma,
  );
  const gicOEF = growthIncidence(
    first.countries['OEF'].logMean, first.countries['OEF'].logSigma,
    last.countries['OEF'].logMean, last.countries['OEF'].logSigma,
  );

  return (
    <div className="p-5 space-y-6">
      {/* Global inequality summary */}
      <div className="grid grid-cols-4 gap-3">
        <Tile label="Global Gini (final)" value={summary.globalGini.toFixed(3)} />
        <Tile label="Theil Between" value={summary.theilBetween.toFixed(3)} sub="Cross-country income gap" />
        <Tile label="Theil Within" value={summary.theilWithin.toFixed(3)} sub="Within-country inequality" />
        <Tile label="Atkinson (ε=0.5)" value={summary.atkinson.toFixed(3)} sub="Welfare cost of inequality" />
      </div>

      {/* Gini over time */}
      <div>
        <Label>Gini Coefficient Over Time</Label>
        <div className="border border-[#D1D5DB] rounded p-3 bg-white">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={giniData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#F3F4F0" />
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={36} domain={[0.2, 0.6]} />
              <Tooltip contentStyle={{ fontSize: 10 }} />
              {COUNTRY_KEYS.map((k, i) => (
                <Line key={k} dataKey={k} stroke={COLORS[i]} dot={false} strokeWidth={1} name={COUNTRIES[k].name} opacity={0.7} />
              ))}
              <Line dataKey="global" stroke="#1A1A1A" dot={false} strokeWidth={2} name="Global (pop. weighted)" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
            {COUNTRY_KEYS.map((k, i) => (
              <span key={k} className="flex items-center gap-1 text-[9px] text-[#6B7280]">
                <span style={{ width: 10, height: 2, background: COLORS[i], display: 'inline-block', borderRadius: 1 }} />
                {k}
              </span>
            ))}
            <span className="flex items-center gap-1 text-[9px] font-semibold text-[#1A1A1A]">
              <span style={{ width: 10, height: 2, background: '#1A1A1A', display: 'inline-block', borderRadius: 1 }} />
              Global
            </span>
          </div>
        </div>
      </div>

      {/* Lorenz curves: US vs OEF */}
      <div className="grid grid-cols-2 gap-4">
        {(['US', 'OEF'] as const).map(k => {
          const ld = lorenzData.find(d => d.key === k)!;
          const lcData = ld.pts0.map((p, i) => ({
            x: +(p.x * 100).toFixed(0),
            initial: +p.y.toFixed(3),
            final: +(ld.pts1[i]?.y ?? p.y).toFixed(3),
            equal: +p.x.toFixed(3),
          }));
          return (
            <div key={k} className="border border-[#D1D5DB] rounded p-3 bg-white">
              <div className="text-[10px] font-semibold text-[#6B7280] mb-2">
                Lorenz Curve — {COUNTRIES[k].name}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={lcData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#F3F4F0" />
                  <XAxis dataKey="x" tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} unit="%" />
                  <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={32} />
                  <Tooltip contentStyle={{ fontSize: 10 }} />
                  <Line dataKey="equal" stroke="#D1D5DB" dot={false} strokeWidth={1} strokeDasharray="3 3" name="Perfect equality" />
                  <Line dataKey="initial" stroke="#9CA3AF" dot={false} strokeWidth={1.5} name="t=0" />
                  <Line dataKey="final" stroke="#2C4A6B" dot={false} strokeWidth={2} name="t=240" />
                </LineChart>
              </ResponsiveContainer>
              <div className="text-[9px] text-[#9CA3AF] mt-1 italic">
                Gini: {first.countries[k].gini.toFixed(3)} → {last.countries[k].gini.toFixed(3)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Growth incidence curves */}
      <div className="grid grid-cols-2 gap-4">
        <GIC title="Growth Incidence — United States" data={gicUS} />
        <GIC title="Growth Incidence — Other Emerging & Frontier" data={gicOEF} />
      </div>
    </div>
  );
}

function GIC({ title, data }: { title: string; data: { percentile: number; growth: number }[] }) {
  return (
    <div className="border border-[#D1D5DB] rounded p-3 bg-white">
      <div className="text-[10px] font-semibold text-[#6B7280] mb-2">{title}</div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="#F3F4F0" />
          <XAxis dataKey="percentile" tick={{ fontSize: 8, fill: '#9CA3AF' }} tickLine={false} axisLine={false} unit="th" />
          <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={32} unit="%" />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Tooltip contentStyle={{ fontSize: 10 }} formatter={(v: any) => [`${Number(v).toFixed(1)}%`, 'Growth']} />
          <Bar dataKey="growth" radius={[2, 2, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.growth >= 0 ? '#2C4A6B' : '#DC2626'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="text-[9px] text-[#9CA3AF] mt-1 italic">
        % change in income by percentile from t=0 to t=240. Negative = real income loss.
      </div>
    </div>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-[#D1D5DB] rounded px-4 py-3 bg-white">
      <div className="text-[10px] uppercase tracking-widest text-[#6B7280] font-semibold">{label}</div>
      <div className="mono text-2xl font-light mt-1 text-[#1A1A1A]">{value}</div>
      {sub && <div className="text-[10px] text-[#9CA3AF] mt-0.5">{sub}</div>}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] mb-2">{children}</div>;
}
