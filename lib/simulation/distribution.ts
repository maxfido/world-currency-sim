import type { CountryKey, CountryState } from './types';
import { COUNTRIES } from './countries';

// Log-normal income distribution tracking
// If X ~ LogNormal(μ, σ²), then Gini = 2*Φ(σ/√2) - 1
// where Φ is the standard normal CDF

function phi(x: number): number {
  // Approximation of the standard normal CDF
  const a = 0.147;
  const sign = x >= 0 ? 1 : -1;
  const v = Math.sqrt(1 - Math.exp(-x * x * (4 / Math.PI + a * x * x) / (1 + a * x * x)));
  return 0.5 * (1 + sign * v);
}

export function giniFromSigma(sigma: number): number {
  return 2 * phi(sigma / Math.sqrt(2)) - 1;
}

export function sigmaFromGini(gini: number): number {
  // Invert: Φ(σ/√2) = (1+g)/2 → σ = √2 * Φ^{-1}((1+g)/2)
  const p = (1 + Math.min(0.99, Math.max(0.01, gini))) / 2;
  // Rational approximation of Φ^{-1}
  return Math.sqrt(2) * probitApprox(p);
}

function probitApprox(p: number): number {
  // Beasley-Springer-Moro rational approximation
  if (p <= 0) return -6;
  if (p >= 1) return 6;
  const a = [2.50662823884, -18.61500062529, 41.39119773534, -25.44106049637];
  const b = [-8.47351093090, 23.08336743743, -21.06224101826, 3.13082909833];
  const c = [0.3374754822726147, 0.9761690190917186, 0.1607979714918209, 0.0276438810333863,
             0.0038405729373609, 0.0003951896511349, 0.0000321767881768, 0.0000002888167364, 0.0000003960315187];
  const r = p - 0.5;
  if (Math.abs(r) < 0.42) {
    const r2 = r * r;
    return r * (((a[3] * r2 + a[2]) * r2 + a[1]) * r2 + a[0]) /
           ((((b[3] * r2 + b[2]) * r2 + b[1]) * r2 + b[0]) * r2 + 1);
  }
  const s = p < 0.5 ? p : 1 - p;
  const t = Math.sqrt(-2 * Math.log(s));
  let z = t - ((c[8] * t + c[7]) * t + c[6]);
  z /= (((((((c[5] * t + c[4]) * t + c[3]) * t + c[2]) * t + c[1]) * t + c[0]) * t + 1));
  return p < 0.5 ? -z : z;
}

// Update log-normal parameters based on growth incidence
// growth: % GDP growth
// giniChange: change in Gini from policy effects
export function updateDistribution(
  logMean: number,
  logSigma: number,
  gdpGrowth: number,           // % change in GDP (monthly)
  architecture: 'fiat' | 'fixed' | 'programmatic' | 'reserve',
  inCrisis: boolean,
  currencyHoldings: number     // country's share of digital currency
): { logMean: number; logSigma: number } {
  // Mean income grows with GDP
  const meanGrowth = gdpGrowth / 100;
  let sigmaChange = 0;

  // Fixed supply: deflation benefits currency holders; hurts leveraged debtors
  // → increases inequality as currency holders are wealthier
  if (architecture === 'fixed') {
    sigmaChange += currencyHoldings * 0.0005 - 0.0001;
  }
  // Programmatic: more stable, slight inequality reduction
  if (architecture === 'programmatic') {
    sigmaChange -= 0.0001;
  }
  // Reserve-backed: moderate
  if (architecture === 'reserve') {
    sigmaChange += 0.00005;
  }
  // Banking crises increase inequality (capital owners better protected)
  if (inCrisis) sigmaChange += 0.0015;

  // Mean-revert sigma toward structural floor
  const structuralSigma = 0.4;
  sigmaChange += 0.01 * (structuralSigma - logSigma);

  return {
    logMean: logMean + meanGrowth,
    logSigma: Math.max(0.2, Math.min(1.2, logSigma + sigmaChange)),
  };
}

// Lorenz curve: 100 points (percentile -> cumulative income share)
export function lorenzPoints(logMean: number, logSigma: number): { x: number; y: number }[] {
  const n = 51;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1);
    if (p === 0) { pts.push({ x: 0, y: 0 }); continue; }
    // L(p) = Φ(Φ^{-1}(p) - σ) for log-normal
    const q = probitApprox(p) - logSigma;
    const ly = phi(q);
    pts.push({ x: p, y: ly });
  }
  return pts;
}

// Global income distribution: combine country log-normals weighted by population
export function globalGiniFromCountries(
  countries: CountryState[]
): { gini: number; theilBetween: number; theilWithin: number; atkinson: number } {
  const params = COUNTRIES;
  // Theil between-group: T_B = Σ s_i * ln(s_i / p_i) where s_i = income share, p_i = pop share
  let theilBetween = 0;
  let theilWithin = 0;
  let totalIncome = 0;

  // Total income: Σ pop_i * exp(μ_i + σ_i²/2)
  const incomes: Record<string, number> = {};
  for (const cs of countries) {
    const p = params[cs.key];
    const meanIncome = Math.exp(cs.logMean + cs.logSigma * cs.logSigma / 2);
    incomes[cs.key] = p.popShare * meanIncome;
    totalIncome += incomes[cs.key];
  }

  for (const cs of countries) {
    const p = params[cs.key];
    const sIncome = totalIncome > 0 ? incomes[cs.key] / totalIncome : 0;
    const sPop = p.popShare;
    if (sIncome > 0 && sPop > 0) {
      theilBetween += sIncome * Math.log(sIncome / sPop);
    }
    // Within-group Theil for log-normal: T_W = σ²/2
    theilWithin += sPop * (cs.logSigma * cs.logSigma / 2);
  }

  const totalTheil = theilBetween + theilWithin;
  // Approximate global Gini from total Theil (rough: G ≈ sqrt(2T) for log-normal)
  const approxSigmaGlobal = Math.sqrt(2 * Math.max(0, totalTheil));
  const gini = giniFromSigma(approxSigmaGlobal);
  // Atkinson index (ε=0.5): A = 1 - (1/μ) * [Σ p_i * y_i^{1-ε}]^{1/(1-ε)}
  // Simplified approximation
  const atkinson = Math.min(0.99, gini * 0.85);

  return { gini, theilBetween, theilWithin, atkinson };
}
