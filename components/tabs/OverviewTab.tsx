'use client';
import { useResultsStore } from '@/store/results';
import { useScenarioStore } from '@/store/scenario';
import { COUNTRY_KEYS } from '@/lib/simulation/types';
import { COUNTRIES } from '@/lib/simulation/countries';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid
} from 'recharts';

const ARCH_COLORS = { fiat: '#6B7280', fixed: '#B45309', programmatic: '#2C4A6B', reserve: '#065F46' };

function HeadlineTile({ label, value, sub, warn }: { label: string; value: string; sub?: string; warn?: boolean }) {
  return (
    <div className={`rounded border px-4 py-3 ${warn ? 'border-red-200 bg-red-50' : 'border-[#D1D5DB] bg-white'}`}>
      <div className="text-[10px] uppercase tracking-widest text-[#6B7280] font-semibold">{label}</div>
      <div className={`mono text-2xl font-light mt-1 ${warn ? 'text-red-600' : 'text-[#1A1A1A]'}`}>{value}</div>
      {sub && <div className="text-[10px] text-[#9CA3AF] mt-0.5">{sub}</div>}
    </div>
  );
}

export default function OverviewTab() {
  const { results } = useResultsStore();
  const { architecture } = useScenarioStore();
  if (!results) return null;

  const { summary, periods } = results;

  // Aggregate metrics
  const worldAvgGrowth = COUNTRY_KEYS.reduce((s, k) => s + summary.avgGrowth[k] * COUNTRIES[k].gdpShare, 0);
  const worldAvgInfl = COUNTRY_KEYS.reduce((s, k) => s + summary.avgInflation[k] * COUNTRIES[k].gdpShare, 0);
  const crisisRate = (summary.totalCrises / 240 * 12).toFixed(1); // per year

  // Build small-multiple time series (sample every 5 periods for performance)
  const sampled = periods.filter((_,i) => i % 3 === 0);

  const gdpData = sampled.map(p => {
    const row: Record<string, number | string> = { t: p.t };
    for (const k of COUNTRY_KEYS) row[k] = +(p.countries[k].gdp - 100).toFixed(2);
    return row;
  });

  const inflData = sampled.map(p => {
    const row: Record<string, number | string> = { t: p.t };
    for (const k of COUNTRY_KEYS) row[k] = +p.countries[k].inflation.toFixed(2);
    return row;
  });

  const giniData = sampled.map(p => {
    const row: Record<string, number | string> = { t: p.t };
    for (const k of COUNTRY_KEYS) row[k] = +p.countries[k].gini.toFixed(3);
    return row;
  });

  const fsiData = sampled.map(p => {
    const row: Record<string, number | string> = { t: p.t };
    for (const k of COUNTRY_KEYS) row[k] = +Math.min(20, p.countries[k].leverage).toFixed(2);
    return row;
  });

  const color = ARCH_COLORS[architecture];

  return (
    <div className="p-5 space-y-5">
      {/* Headline tiles */}
      <div className="grid grid-cols-4 gap-3">
        <HeadlineTile
          label="Avg. GDP Growth"
          value={`${worldAvgGrowth.toFixed(2)}%`}
          sub="Annualized, GDP-weighted"
        />
        <HeadlineTile
          label="Avg. Inflation"
          value={`${worldAvgInfl.toFixed(1)}%`}
          sub="GDP-weighted, 240 periods"
        />
        <HeadlineTile
          label="Global Gini (final)"
          value={summary.globalGini.toFixed(3)}
          sub={`Between: ${summary.theilBetween.toFixed(3)} | Within: ${summary.theilWithin.toFixed(3)}`}
        />
        <HeadlineTile
          label="Financial Crises"
          value={`${summary.totalCrises}`}
          sub={`~${crisisRate} per year`}
          warn={summary.totalCrises > 10}
        />
      </div>

      {/* Country summary table */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] mb-2">Country Summary</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D1D5DB]">
                <th className="text-left py-1.5 pr-3 text-[#6B7280] font-medium">Country</th>
                <th className="text-right py-1.5 px-2 text-[#6B7280] font-medium">GDP Growth</th>
                <th className="text-right py-1.5 px-2 text-[#6B7280] font-medium">Avg. Inflation</th>
                <th className="text-right py-1.5 px-2 text-[#6B7280] font-medium">Final Gini</th>
                <th className="text-right py-1.5 px-2 text-[#6B7280] font-medium">Crises/yr</th>
              </tr>
            </thead>
            <tbody>
              {COUNTRY_KEYS.map(k => (
                <tr key={k} className="border-b border-[#F3F4F0] hover:bg-[#F9FAF8]">
                  <td className="py-1.5 pr-3 font-medium text-[#1A1A1A]">{COUNTRIES[k].name}</td>
                  <td className="mono text-right px-2 text-[#2C4A6B]">{summary.avgGrowth[k].toFixed(2)}%</td>
                  <td className="mono text-right px-2">{summary.avgInflation[k].toFixed(1)}%</td>
                  <td className="mono text-right px-2">{summary.finalGini[k].toFixed(3)}</td>
                  <td className="mono text-right px-2">{(summary.crisisFrequency[k] * 12).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Small multiples: 4 charts */}
      <div className="grid grid-cols-2 gap-4">
        <MiniChart title="Real GDP Index (vs 100)" data={gdpData} unit="pt" refLine={0} />
        <MiniChart title="Inflation (%)" data={inflData} unit="%" refLine={2} />
        <MiniChart title="Gini Coefficient" data={giniData} unit="" refLine={undefined} />
        <MiniChart title="Banking Leverage (x)" data={fsiData} unit="x" refLine={12} />
      </div>
    </div>
  );
}

function MiniChart({
  title, data, unit, refLine
}: {
  title: string;
  data: Record<string, number | string>[];
  unit: string;
  refLine?: number;
}) {
  const colors = ['#2C4A6B', '#B45309', '#065F46', '#7C3AED', '#DC2626', '#0891B2', '#D97706', '#4B5563'];

  return (
    <div className="border border-[#D1D5DB] rounded p-3 bg-white">
      <div className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">{title}</div>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 2, right: 4, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="#F3F4F0" />
          <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={32} />
          <Tooltip
            contentStyle={{ fontSize: 10, border: '1px solid #D1D5DB', borderRadius: 4 }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(v: any) => [`${Number(v).toFixed(2)}${unit}`, '']}
          />
          {refLine !== undefined && (
            <ReferenceLine y={refLine} stroke="#D1D5DB" strokeDasharray="3 3" />
          )}
          {COUNTRY_KEYS.map((k, i) => (
            <Line
              key={k}
              dataKey={k}
              stroke={colors[i % colors.length]}
              dot={false}
              strokeWidth={1.2}
              name={k}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
        {COUNTRY_KEYS.map((k, i) => (
          <span key={k} className="flex items-center gap-1 text-[9px] text-[#6B7280]">
            <span style={{ width: 8, height: 2, background: ['#2C4A6B', '#B45309', '#065F46', '#7C3AED', '#DC2626', '#0891B2', '#D97706', '#4B5563'][i], display: 'inline-block', borderRadius: 1 }} />
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}
