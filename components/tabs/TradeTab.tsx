'use client';
import { useResultsStore } from '@/store/results';
import { COUNTRY_KEYS } from '@/lib/simulation/types';
import { COUNTRIES } from '@/lib/simulation/countries';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts';

const COLORS = ['#2C4A6B', '#B45309', '#065F46', '#7C3AED', '#DC2626', '#0891B2', '#D97706', '#4B5563'];

export default function TradeTab() {
  const { results } = useResultsStore();
  if (!results) return null;

  const { periods } = results;
  const sampled = periods.filter((_, i) => i % 3 === 0);

  // Net exports time series
  const nxData = sampled.map(p => ({
    t: p.t,
    ...Object.fromEntries(COUNTRY_KEYS.map(k => [k, +p.countries[k].netExports.toFixed(2)])),
  }));

  // Exchange rates vs initial
  const erData = sampled.map(p => ({
    t: p.t,
    ...Object.fromEntries(COUNTRY_KEYS.map(k => [k, +p.countries[k].exchangeRate.toFixed(3)])),
  }));

  // Final trade matrix for heatmap
  const finalPeriod = periods[periods.length - 1];
  const tradeMatrix = finalPeriod.trade.shares;

  return (
    <div className="p-5 space-y-6">
      {/* Trade Balance Heatmap */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] mb-2">
          Final Trade Share Matrix (Armington, θ=4)
        </div>
        <TradeHeatmap tradeMatrix={tradeMatrix} />
        <p className="text-[10px] text-[#9CA3AF] mt-1.5 italic">
          Cell (row i, col j) = import share of i from j as % of i's GDP. Darker = larger bilateral flow.
        </p>
      </div>

      {/* Net Exports */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] mb-2">
          Net Exports (% of GDP)
        </div>
        <div className="border border-[#D1D5DB] rounded p-3 bg-white">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={nxData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#F3F4F0" />
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={32} />
              <Tooltip contentStyle={{ fontSize: 10 }} />
              <ReferenceLine y={0} stroke="#D1D5DB" />
              {COUNTRY_KEYS.map((k, i) => (
                <Line key={k} dataKey={k} stroke={COLORS[i]} dot={false} strokeWidth={1.2} name={COUNTRIES[k].name} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <Legend />
        </div>
      </div>

      {/* Exchange rates */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] mb-2">
          Exchange Rate vs. Global Digital Currency (index, t=0 = 1.0)
        </div>
        <div className="border border-[#D1D5DB] rounded p-3 bg-white">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={erData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#F3F4F0" />
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={36} />
              <Tooltip contentStyle={{ fontSize: 10 }} />
              <ReferenceLine y={1} stroke="#D1D5DB" strokeDasharray="3 3" />
              {COUNTRY_KEYS.map((k, i) => (
                <Line key={k} dataKey={k} stroke={COLORS[i]} dot={false} strokeWidth={1.2} name={COUNTRIES[k].name} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <Legend />
        </div>
      </div>
    </div>
  );
}

function TradeHeatmap({ tradeMatrix }: { tradeMatrix: Record<string, Record<string, number>> }) {
  // Find max for color scaling
  let maxVal = 0;
  for (const imp of COUNTRY_KEYS) {
    for (const exp of COUNTRY_KEYS) {
      if (imp !== exp) maxVal = Math.max(maxVal, tradeMatrix[imp]?.[exp] ?? 0);
    }
  }

  function cellColor(val: number): string {
    if (val === 0) return '#F9FAF8';
    const intensity = Math.min(1, val / maxVal);
    const r = Math.round(44 + (200 - 44) * (1 - intensity));
    const g = Math.round(74 + (225 - 74) * (1 - intensity));
    const b = Math.round(107 + (240 - 107) * (1 - intensity));
    return `rgb(${r},${g},${b})`;
  }

  return (
    <div className="border border-[#D1D5DB] rounded overflow-auto bg-white">
      <table className="text-[9px] border-collapse w-full">
        <thead>
          <tr>
            <th className="p-1.5 text-[#9CA3AF] font-normal text-left border-b border-r border-[#E5E7EB]">
              imp ↓ / exp →
            </th>
            {COUNTRY_KEYS.map(k => (
              <th key={k} className="p-1.5 text-center text-[#6B7280] font-semibold border-b border-[#E5E7EB]" style={{ minWidth: 44 }}>
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COUNTRY_KEYS.map(imp => (
            <tr key={imp}>
              <td className="p-1.5 font-semibold text-[#6B7280] border-r border-[#E5E7EB]">{imp}</td>
              {COUNTRY_KEYS.map(exp => {
                const val = imp === exp ? 0 : (tradeMatrix[imp]?.[exp] ?? 0);
                return (
                  <td
                    key={exp}
                    className="p-1.5 text-center mono"
                    style={{
                      background: imp === exp ? '#F3F4F0' : cellColor(val),
                      color: imp === exp ? '#D1D5DB' : val > maxVal * 0.5 ? 'white' : '#1A1A1A',
                    }}
                    title={`${imp} imports from ${exp}: ${(val * 100).toFixed(2)}% of GDP`}
                  >
                    {imp === exp ? '—' : (val * 100).toFixed(1)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Legend() {
  const colors = ['#2C4A6B', '#B45309', '#065F46', '#7C3AED', '#DC2626', '#0891B2', '#D97706', '#4B5563'];
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
      {COUNTRY_KEYS.map((k, i) => (
        <span key={k} className="flex items-center gap-1 text-[9px] text-[#6B7280]">
          <span style={{ width: 10, height: 2, background: colors[i], display: 'inline-block', borderRadius: 1 }} />
          {COUNTRIES[k].name}
        </span>
      ))}
    </div>
  );
}
