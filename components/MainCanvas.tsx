'use client';
import { useResultsStore } from '@/store/results';
import type { TabId } from '@/lib/simulation/types';
import OverviewTab from './tabs/OverviewTab';
import TradeTab from './tabs/TradeTab';
import MacroTab from './tabs/MacroTab';
import DistributionTab from './tabs/DistributionTab';
import CrisisTab from './tabs/CrisisTab';
import InsightsTab from './tabs/InsightsTab';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'trade', label: 'Trade' },
  { id: 'macro', label: 'Macro' },
  { id: 'distribution', label: 'Distribution' },
  { id: 'crisis', label: 'Crisis' },
  { id: 'insights', label: 'AI Insights' },
];

export default function MainCanvas() {
  const { focusedTab, setTab, results } = useResultsStore();

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-[#D1D5DB] shrink-0 px-4 bg-[#FAFAF7]">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
              focusedTab === t.id
                ? 'border-[#2C4A6B] text-[#2C4A6B]'
                : 'border-transparent text-[#6B7280] hover:text-[#1A1A1A]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {!results ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="text-2xl font-light text-[#D1D5DB] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              No results yet
            </div>
            <p className="text-sm text-[#9CA3AF] max-w-md leading-relaxed">
              Select a monetary architecture and initial distribution, adjust parameters if desired,
              then press <span className="font-semibold text-[#2C4A6B]">Run Simulation</span> to compute
              240 monthly periods across 8 country groups.
            </p>
          </div>
        ) : (
          <>
            {focusedTab === 'overview' && <OverviewTab />}
            {focusedTab === 'trade' && <TradeTab />}
            {focusedTab === 'macro' && <MacroTab />}
            {focusedTab === 'distribution' && <DistributionTab />}
            {focusedTab === 'crisis' && <CrisisTab />}
            {focusedTab === 'insights' && <InsightsTab />}
          </>
        )}
      </div>
    </div>
  );
}
