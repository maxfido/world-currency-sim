import { lorenzPoints, giniFromSigma } from '../simulation/distribution';
import type { CountryState } from '../simulation/types';

export interface InequalityMetrics {
  gini: number;
  theilBetween: number;
  theilWithin: number;
  atkinson: number;
  lorenz: { x: number; y: number }[];
}

export function computeInequality(cs: CountryState): InequalityMetrics {
  const gini = giniFromSigma(cs.logSigma);
  const lorenz = lorenzPoints(cs.logMean, cs.logSigma);
  const theilWithin = cs.logSigma * cs.logSigma / 2;
  return {
    gini,
    theilBetween: 0,  // single country: no between-group component
    theilWithin,
    atkinson: gini * 0.85,
    lorenz,
  };
}

// Growth incidence curve: % change in income by percentile
// Compares two log-normal distributions
export function growthIncidence(
  logMean0: number,
  logSigma0: number,
  logMean1: number,
  logSigma1: number,
  nBins = 20
): { percentile: number; growth: number }[] {
  const pts: { percentile: number; growth: number }[] = [];
  for (let i = 0; i < nBins; i++) {
    const p = (i + 0.5) / nBins;
    // Quantile of log-normal: Q(p) = exp(μ + σ * Φ^{-1}(p))
    const q0 = quantileLN(logMean0, logSigma0, p);
    const q1 = quantileLN(logMean1, logSigma1, p);
    const growth = q0 > 0 ? ((q1 - q0) / q0) * 100 : 0;
    pts.push({ percentile: Math.round((i + 0.5) / nBins * 100), growth });
  }
  return pts;
}

function quantileLN(mu: number, sigma: number, p: number): number {
  return Math.exp(mu + sigma * probit(p));
}

function probit(p: number): number {
  if (p <= 0) return -6;
  if (p >= 1) return 6;
  const c = [2.515517, 0.802853, 0.010328];
  const d = [1.432788, 0.189269, 0.001308];
  const t = p < 0.5
    ? Math.sqrt(-2 * Math.log(p))
    : Math.sqrt(-2 * Math.log(1 - p));
  const z = t - (c[0] + c[1] * t + c[2] * t * t) / (1 + d[0] * t + d[1] * t * t + d[2] * t * t * t);
  return p < 0.5 ? -z : z;
}
