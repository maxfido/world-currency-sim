'use client';
import { useResultsStore } from '@/store/results';
import { COUNTRY_KEYS } from '@/lib/simulation/types';
import { COUNTRIES } from '@/lib/simulation/countries';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, AreaChart, Area
} from 'recharts';

const COLORS = ['#2C4A6B', '#B45309', '#065F46', '#7C3AED', '#DC2626', '#0891B2', '#D97706', '#4B5563'];

export default function MacroTab() {
  const { results } = useResultsStore();
  if (!results) return null;

  const { periods } = results;
  const sampled = periods.filter((_, i) => i % 3 === 0);

  const priceData = sampled.map(p => ({
    t: p.t,
    price: +p.global.priceLevel.toFixed(3),
    velocity: +p.global.velocity.toFixed(3),
  }));

  const inflData = sampled.map(p => ({
    t: p.t,
    ...Object.fromEntries(COUNTRY_KEYS.map(k => [k, +p.countries[k].inflation.toFixed(2)])),
  }));

  const rateData = sampled.map(p => ({
    t: p.t,
    ...Object.fromEntries(COUNTRY_KEYS.map(k => [k, +p.countries[k].realRate.toFixed(2)])),
  }));

  const unempData = sampled.map(p => ({
    t: p.t,
    ...Object.fromEntries(COUNTRY_KEYS.map(k => [k, +p.countries[k].unemployment.toFixed(2)])),
  }));

  return (
    <div className="p-5 space-y-6">
      {/* Global price level and velocity */}
      <div>
        <SectionLabel>Global Price Level &amp; Money Velocity</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <ChartBox title="Price Level (index, t=0 = 1.0)">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={priceData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#F3F4F0" />
                <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={36} />
                <Tooltip contentStyle={{ fontSize: 10 }} />
                <ReferenceLine y={1} stroke="#D1D5DB" strokeDasharray="3 3" />
                <Line dataKey="price" stroke="#2C4A6B" dot={false} strokeWidth={2} name="Price Level" />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>
          <ChartBox title="Money Velocity (V̄ / (1 + βv·E[π]))">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={priceData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#F3F4F0" />
                <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={36} />
                <Tooltip contentStyle={{ fontSize: 10 }} />
                <Line dataKey="velocity" stroke="#B45309" dot={false} strokeWidth={2} name="Velocity" />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>
        </div>
      </div>

      {/* Inflation paths */}
      <div>
        <SectionLabel>Inflation by Region (%)</SectionLabel>
        <ChartBox title="">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={inflData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#F3F4F0" />
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={32} />
              <Tooltip contentStyle={{ fontSize: 10 }} />
              <ReferenceLine y={2} stroke="#2C4A6B" strokeDasharray="3 3" label={{ value: 'π*=2%', fontSize: 9, fill: '#2C4A6B' }} />
              <ReferenceLine y={0} stroke="#DC2626" strokeDasharray="2 2" />
              {COUNTRY_KEYS.map((k, i) => (
                <Line key={k} dataKey={k} stroke={COLORS[i]} dot={false} strokeWidth={1.2} name={COUNTRIES[k].name} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <Legend />
        </ChartBox>
      </div>

      {/* Real rates */}
      <div>
        <SectionLabel>Real Interest Rates by Region (%)</SectionLabel>
        <ChartBox title="">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={rateData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#F3F4F0" />
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={32} />
              <Tooltip contentStyle={{ fontSize: 10 }} />
              <ReferenceLine y={0} stroke="#DC2626" strokeDasharray="2 2" />
              {COUNTRY_KEYS.map((k, i) => (
                <Line key={k} dataKey={k} stroke={COLORS[i]} dot={false} strokeWidth={1.2} name={COUNTRIES[k].name} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <Legend />
        </ChartBox>
      </div>

      {/* Unemployment */}
      <div>
        <SectionLabel>Unemployment by Region (%)</SectionLabel>
        <ChartBox title="">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={unempData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#F3F4F0" />
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={32} />
              <Tooltip contentStyle={{ fontSize: 10 }} />
              {COUNTRY_KEYS.map((k, i) => (
                <Line key={k} dataKey={k} stroke={COLORS[i]} dot={false} strokeWidth={1.2} name={COUNTRIES[k].name} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <Legend />
        </ChartBox>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] mb-2">
      {children}
    </div>
  );
}

function ChartBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#D1D5DB] rounded p-3 bg-white">
      {title && <div className="text-[10px] text-[#9CA3AF] mb-1">{title}</div>}
      {children}
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
