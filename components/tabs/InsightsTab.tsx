'use client';
import { useResultsStore } from '@/store/results';
import { useScenarioStore } from '@/store/scenario';

const SECTION_HEADERS = [
  '## Overall Outcome',
  '## Winners and Losers',
  '## What the Monetary Architecture Did',
  '## Surprising Finding',
  '## Bottom Line',
];

function parseInsights(text: string): { heading: string; body: string }[] {
  const sections: { heading: string; body: string }[] = [];
  let remaining = text;

  for (let i = 0; i < SECTION_HEADERS.length; i++) {
    const header = SECTION_HEADERS[i];
    const nextHeader = SECTION_HEADERS[i + 1];
    const start = remaining.indexOf(header);
    if (start === -1) continue;

    const bodyStart = start + header.length;
    const end = nextHeader ? remaining.indexOf(nextHeader, bodyStart) : remaining.length;
    const body = remaining.slice(bodyStart, end !== -1 ? end : undefined).trim();
    sections.push({ heading: header.replace('## ', ''), body });
  }

  return sections;
}

export default function InsightsTab() {
  const { results, aiInsights, isLoadingInsights, setAiInsights, setLoadingInsights } = useResultsStore();
  const { architecture, distribution, params } = useScenarioStore();

  async function generate() {
    if (!results) return;
    setLoadingInsights(true);
    setAiInsights(null);
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          architecture,
          distribution,
          params,
          summary: results.summary,
        }),
      });
      const data = await res.json();
      setAiInsights(data.insights ?? 'No insights returned.');
    } catch {
      setAiInsights('Error generating insights. Check that ANTHROPIC_API_KEY is set in .env.local.');
    } finally {
      setLoadingInsights(false);
    }
  }

  const sections = aiInsights ? parseInsights(aiInsights) : [];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-[#1A1A1A] mb-1" style={{ fontFamily: 'Georgia, serif' }}>
          AI Insights
        </h2>
        <p className="text-xs text-[#6B7280] leading-relaxed">
          Claude analyzes your simulation results and explains what happened in plain English.
        </p>
      </div>

      {!aiInsights && !isLoadingInsights && (
        <button
          onClick={generate}
          className="px-4 py-2 text-sm font-medium bg-[#2C4A6B] text-white rounded hover:bg-[#1e3450] transition-colors"
        >
          Generate Insights
        </button>
      )}

      {isLoadingInsights && (
        <div className="flex items-center gap-3 text-sm text-[#6B7280]">
          <span className="animate-spin text-base">⟳</span>
          Asking Claude to analyze results…
        </div>
      )}

      {aiInsights && sections.length > 0 && (
        <div className="space-y-5">
          {sections.map((s) => (
            <div key={s.heading} className="rounded-lg bg-[#F3F4F0] border border-[#E5E7EB] px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-[#2C4A6B] mb-1.5">
                {s.heading}
              </div>
              <p className="text-sm text-[#1A1A1A] leading-relaxed">{s.body}</p>
            </div>
          ))}
          <button
            onClick={generate}
            className="text-xs text-[#6B7280] hover:text-[#1A1A1A] underline"
          >
            Regenerate
          </button>
        </div>
      )}

      {aiInsights && sections.length === 0 && (
        <div className="rounded-lg bg-[#F3F4F0] border border-[#E5E7EB] px-4 py-3">
          <p className="text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">{aiInsights}</p>
          <button
            onClick={generate}
            className="mt-3 text-xs text-[#6B7280] hover:text-[#1A1A1A] underline"
          >
            Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
