'use client';
import { useScenarioStore } from '@/store/scenario';
import { useResultsStore } from '@/store/results';
import { runSimulation } from '@/lib/simulation/run';
import Link from 'next/link';

export default function SimHeader() {
  const { architecture, distribution, params, seed, isStale, markFresh } = useScenarioStore();
  const { setResults, setRunning, isRunning } = useResultsStore();

  async function handleRun() {
    setRunning(true);
    markFresh();
    await new Promise(r => setTimeout(r, 10));
    try {
      const results = runSimulation(architecture, distribution, params, seed);
      setResults(results);
    } finally {
      setRunning(false);
    }
  }

  return (
    <header className="border-b border-[#D1D5DB] bg-[#FAFAF7] px-6 py-3 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-base font-semibold tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>
          Global Digital Currency Simulation
        </h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          IS-LM · Armington Trade · Fisher Banking · Log-Normal Inequality · 8 Regions · 240 Periods
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/methodology"
          className="text-xs text-[#2C4A6B] hover:underline"
        >
          Methodology
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
          <span>seed</span>
          <span className="mono font-medium text-[#1A1A1A]">{seed}</span>
        </div>

        {isStale && !isRunning && (
          <span className="text-xs text-amber-600 font-medium">● parameters changed</span>
        )}
        {isRunning && (
          <span className="text-xs text-[#2C4A6B] animate-pulse">running…</span>
        )}

        <button
          onClick={handleRun}
          disabled={isRunning}
          className="px-3 py-1.5 text-xs font-medium bg-[#2C4A6B] text-white rounded hover:bg-[#1e3450] disabled:opacity-50 transition-colors"
        >
          {isRunning ? 'Running…' : 'Run Simulation'}
        </button>
      </div>
    </header>
  );
}
