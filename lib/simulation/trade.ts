import type { CountryKey, TradeMatrix } from './types';
import { COUNTRY_KEYS } from './types';
import { COUNTRIES } from './countries';

// Iceberg trade costs: baseline symmetric matrix, modified by architecture
// Lower = cheaper trade; 1.0 means trade costs absorb all value
const BASE_COSTS: Record<CountryKey, Record<CountryKey, number>> = (() => {
  const m: Record<CountryKey, Record<CountryKey, number>> = {} as Record<CountryKey, Record<CountryKey, number>>;
  // Geographic + institutional proximity weights
  const proxies: Record<CountryKey, Partial<Record<CountryKey, number>>> = {
    US:  { EZ: 1.3, CN: 1.5, JP: 1.4, UK: 1.25, OA: 1.35, EA: 1.55, OEF: 1.65 },
    EZ:  { US: 1.3, CN: 1.45, JP: 1.5, UK: 1.15, OA: 1.4, EA: 1.5, OEF: 1.6 },
    CN:  { US: 1.5, EZ: 1.45, JP: 1.3, UK: 1.5, OA: 1.4, EA: 1.25, OEF: 1.35 },
    JP:  { US: 1.4, EZ: 1.5, CN: 1.3, UK: 1.55, OA: 1.35, EA: 1.3, OEF: 1.5 },
    UK:  { US: 1.25, EZ: 1.15, CN: 1.5, JP: 1.55, OA: 1.4, EA: 1.55, OEF: 1.6 },
    OA:  { US: 1.35, EZ: 1.4, CN: 1.4, JP: 1.35, UK: 1.4, EA: 1.4, OEF: 1.5 },
    EA:  { US: 1.55, EZ: 1.5, CN: 1.25, JP: 1.3, UK: 1.55, OA: 1.4, OEF: 1.3 },
    OEF: { US: 1.65, EZ: 1.6, CN: 1.35, JP: 1.5, UK: 1.6, OA: 1.5, EA: 1.3 },
  };
  for (const a of COUNTRY_KEYS) {
    m[a] = {} as Record<CountryKey, number>;
    for (const b of COUNTRY_KEYS) {
      if (a === b) { m[a][b] = 0; continue; }
      m[a][b] = proxies[a][b] ?? 1.4;
    }
  }
  return m;
})();

// Digital currency reduces transaction costs for cross-border trade
function effectiveCost(
  a: CountryKey,
  b: CountryKey,
  architecture: 'fiat' | 'fixed' | 'programmatic' | 'reserve',
  t: number
): number {
  const base = BASE_COSTS[a][b];
  if (architecture === 'fiat') return base;
  // Digital currency lowers trade costs over time as adoption grows
  const adoptionFactor = Math.min(1, t / 120); // full adoption at t=120
  const reduction = architecture === 'fixed' ? 0.08 : architecture === 'programmatic' ? 0.06 : 0.05;
  return base * (1 - reduction * adoptionFactor);
}

// Armington (CES) trade share: π_ij = (c_j * τ_ij)^{-θ} / Σ_k (c_k * τ_ik)^{-θ}
// c_k = cost-adjusted price (use gdp-weighted price level proxy)
export function computeTradeMatrix(
  priceLevels: Record<CountryKey, number>,
  architecture: 'fiat' | 'fixed' | 'programmatic' | 'reserve',
  theta: number,
  t: number
): TradeMatrix {
  const shares: TradeMatrix['shares'] = {} as TradeMatrix['shares'];

  for (const imp of COUNTRY_KEYS) {
    shares[imp] = {} as Record<CountryKey, number>;
    let denom = 0;
    const weights: Record<CountryKey, number> = {} as Record<CountryKey, number>;

    for (const exp of COUNTRY_KEYS) {
      if (imp === exp) continue;
      const tau = effectiveCost(exp, imp, architecture, t);
      const c = priceLevels[exp] * tau;
      const w = Math.pow(c, -theta);
      weights[exp] = w;
      denom += w;
    }

    const totalOpenness = COUNTRIES[imp].openness;
    for (const exp of COUNTRY_KEYS) {
      if (imp === exp) { shares[imp][exp] = 0; continue; }
      // Share of imports from exp; scale by importer's openness
      shares[imp][exp] = denom > 0 ? (weights[exp] / denom) * totalOpenness * COUNTRIES[exp].gdpShare : 0;
    }
  }

  return { shares };
}

// Net exports as % of GDP for country i given trade matrix
export function computeNetExports(
  key: CountryKey,
  trade: TradeMatrix,
  gdps: Record<CountryKey, number>
): number {
  let exports_ = 0;
  let imports_ = 0;

  for (const other of COUNTRY_KEYS) {
    if (other === key) continue;
    // Exports: other imports from key
    exports_ += trade.shares[other][key] * gdps[other];
    // Imports: key imports from other
    imports_ += trade.shares[key][other] * gdps[key];
  }

  return gdps[key] > 0 ? ((exports_ - imports_) / gdps[key]) * 100 : 0;
}
