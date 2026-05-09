import Link from 'next/link';
import { EQUATIONS } from '@/lib/equations';
import { ASSUMPTIONS } from '@/lib/assumptions';
import { CITATIONS } from '@/lib/citations';
import { renderKatex } from '@/lib/katexHelper';

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <div className="max-w-3xl mx-auto px-8 py-12">
        {/* Nav */}
        <div className="mb-8">
          <Link href="/" className="text-xs text-[#2C4A6B] hover:underline">← Back to simulation</Link>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-light text-[#1A1A1A] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
          Model Documentation
        </h1>
        <p className="text-sm text-[#6B7280] mb-8">
          Global Digital Currency Simulation — methodology, equations, and calibration
        </p>

        <hr className="border-[#D1D5DB] mb-8" />

        {/* Abstract */}
        <Section title="Abstract">
          <p>
            This simulation models the macroeconomic consequences of adopting a global digital currency
            across eight country groups over 240 monthly periods (20 years). Four monetary architectures
            are compared: a fiat baseline with discretionary central banks, a fixed-supply architecture
            (analogous to Bitcoin), a programmatic NGDP-targeting rule, and a reserve-backed stablecoin.
          </p>
          <p className="mt-3">
            The model integrates an IS-LM framework for output and interest rates, an expectations-augmented
            Phillips Curve for inflation dynamics, Armington trade with iceberg costs for bilateral trade
            flows, a Fisher debt-deflation mechanism for banking crises, and log-normal distributions for
            within-country inequality tracking. Cross-country spillovers arise through correlated TFP shocks
            and the exchange rate channel.
          </p>
        </Section>

        {/* Country groups */}
        <Section title="Country Groups">
          <p className="mb-3 text-sm text-[#6B7280]">
            Eight groups calibrated to 2023 IMF World Economic Outlook data.
          </p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D1D5DB]">
                {['Group', 'GDP Share', 'Pop. Share', 'NAIRU', 'Trend Growth', 'Initial Gini'].map(h => (
                  <th key={h} className="text-left py-1.5 pr-4 text-[#6B7280] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['United States', '25.4%', '4.3%', '4.5%', '2.5%', '0.41'],
                ['Eurozone', '17.2%', '4.5%', '6.5%', '1.6%', '0.31'],
                ['China', '18.1%', '17.8%', '5.0%', '4.5%', '0.46'],
                ['Japan', '6.5%', '1.6%', '3.0%', '1.0%', '0.33'],
                ['United Kingdom', '4.3%', '0.9%', '5.0%', '1.8%', '0.35'],
                ['Other Advanced', '8.2%', '3.8%', '5.5%', '2.0%', '0.30'],
                ['Emerging Asia', '12.1%', '31.5%', '6.0%', '5.5%', '0.38'],
                ['Other Emerging & Frontier', '8.2%', '35.6%', '7.0%', '3.5%', '0.45'],
              ].map(row => (
                <tr key={row[0]} className="border-b border-[#F3F4F0]">
                  {row.map((v, i) => (
                    <td key={i} className={`py-1.5 pr-4 ${i === 0 ? 'font-medium text-[#1A1A1A]' : 'mono text-[#6B7280]'}`}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Equations */}
        <Section title="Model Equations">
          <div className="space-y-6">
            {EQUATIONS.map(eq => (
              <div key={eq.id}>
                <div className="font-semibold text-sm text-[#1A1A1A] mb-1">{eq.name}</div>
                <div
                  className="bg-[#F3F4F0] rounded px-4 py-3 overflow-x-auto text-sm"
                  dangerouslySetInnerHTML={{ __html: renderKatex(eq.latex, true) }}
                />
                <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">{eq.description}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Architecture definitions */}
        <Section title="Monetary Architecture Definitions">
          <div className="space-y-4 text-sm">
            <div>
              <span className="font-semibold text-[#1A1A1A]">Fiat Baseline.</span>{' '}
              Each country group retains an independent central bank following a Taylor rule with
              φπ = 1.5 and φy = 0.5. Money supply growth is endogenous to the Taylor rule.
              Exchange rates float freely under UIP. This is the counterfactual benchmark.
            </div>
            <div>
              <span className="font-semibold text-[#1A1A1A]">Fixed Supply.</span>{' '}
              Total digital currency supply is held constant (μ = 0). Under quantity theory,
              MV = PY, any real growth in Y combined with fixed M and potentially falling V
              produces deflation. This creates a Fisher debt-deflation channel: unexpected price
              declines erode bank net worth, potentially triggering crises. Currency holders
              (wealthier households) benefit; debtors lose. Countries that adopted the currency
              early hold larger shares (empirical distribution).
            </div>
            <div>
              <span className="font-semibold text-[#1A1A1A]">Programmatic.</span>{' '}
              Supply grows at 4% per year (≈ trend NGDP growth) with a feedback rule that
              contracts growth when world NGDP exceeds target. This eliminates central bank
              discretion while providing a stable nominal anchor. The rule reduces, but does
              not eliminate, inflation volatility — supply shocks still pass through.
            </div>
            <div>
              <span className="font-semibold text-[#1A1A1A]">Reserve-Backed.</span>{' '}
              Digital currency supply is backed by a portfolio of fiat reserves (ρ = 30% baseline).
              Supply expands endogenously as reserves accumulate. Exchange rates are managed in
              a partial float. Trade cost reductions are smaller than the fixed-supply case
              because counterparty risk in the backing portfolio limits adoption.
            </div>
          </div>
        </Section>

        {/* Shocks and calibration */}
        <Section title="Shocks and Calibration">
          <div className="space-y-3 text-sm text-[#1A1A1A]">
            <p>
              TFP shocks are drawn from a multivariate normal distribution using a factor model.
              Advanced economies (US, EZ, JP, UK, OA) share a common factor with correlation
              ρ = 0.6. China loads at ρ = 0.3 and emerging markets at ρ = 0.4 with each other
              and ρ = 0.25 with advanced economies.
            </p>
            <p>
              Inflation shocks are independently drawn per country (after loading on the common
              factor at σε = 0.4% monthly, annualizing to ≈ 1.4%). The seeded LCG random
              number generator ensures exact reproducibility: changing the seed traces a different
              but deterministic path through the shock distribution.
            </p>
            <p>
              Initial conditions are calibrated to 2023 actuals. Income distributions are
              parameterized as log-normal, with σ recovered from the initial Gini via the
              closed-form relationship Gini = 2Φ(σ/√2) − 1.
            </p>
          </div>
        </Section>

        {/* Assumption inventory */}
        <Section title="Assumption Inventory">
          <div className="space-y-2">
            {ASSUMPTIONS.map(a => (
              <div key={a.id} className="flex gap-4 text-xs py-1.5 border-b border-[#F3F4F0]">
                <div className="w-48 shrink-0">
                  <span className="font-medium text-[#1A1A1A]">{a.label}</span>
                  <span className="mono text-[#6B7280] ml-1.5">{a.symbol}</span>
                </div>
                <div className="mono text-[#2C4A6B] w-16 shrink-0">
                  {a.defaultValue}{a.unit}
                </div>
                <div className="text-[#9CA3AF] italic flex-1">{a.citation}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Bibliography */}
        <Section title="Bibliography">
          <div className="space-y-3">
            {CITATIONS.map(c => (
              <div key={c.id} className="text-xs">
                <span className="text-[#1A1A1A]">{c.authors} ({c.year}). </span>
                <span className="italic">{c.title}. </span>
                <span className="text-[#6B7280]">{c.journal}.</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Caveats */}
        <Section title="Limitations and Caveats">
          <div className="text-sm text-[#6B7280] space-y-2">
            <p>
              This model is a calibrated teaching instrument, not a structural policy tool. All
              parameters are set to illustrative values consistent with the empirical literature
              but are not estimated via GMM or Bayesian methods. Confidence intervals are not
              reported; the seeded RNG traces a single draw from the shock distribution.
            </p>
            <p>
              The model abstracts from: sovereign debt dynamics, labor market heterogeneity, fiscal
              policy, capital account controls, and second-order network effects of digital currency
              adoption. The Armington trade structure imposes symmetric elasticities and ignores
              extensive margin responses (new firm entry, product variety).
            </p>
            <p>
              Results should be interpreted as directional intuitions about the comparative statics
              of different monetary architectures, not as quantitative forecasts.
            </p>
          </div>
        </Section>

        <div className="mt-12 pt-6 border-t border-[#D1D5DB] text-[10px] text-[#9CA3AF]">
          Parameters are illustrative; this model is for educational use only.
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
        {title}
      </h2>
      <div className="text-sm text-[#1A1A1A] leading-relaxed">
        {children}
      </div>
    </section>
  );
}
