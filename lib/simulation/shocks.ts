import type { CountryKey } from './types';
import { COUNTRY_KEYS } from './types';

// Multiplicative Linear Congruential Generator — reproducible across JS engines
export class SeededRNG {
  private state: number;
  constructor(seed: number) {
    this.state = seed >>> 0;
  }
  next(): number {
    this.state = (Math.imul(1664525, this.state) + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }
  // Box-Muller normal sample
  normal(mu = 0, sigma = 1): number {
    const u1 = Math.max(1e-10, this.next());
    const u2 = this.next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mu + sigma * z;
  }
}

// Correlation matrix (lower-triangular Cholesky) for 8 countries
// Advanced economies more correlated with each other
const RHO_ADVANCED = 0.6;   // US,EZ,JP,UK,OA among themselves
const RHO_CHINA = 0.3;      // CN with advanced
const RHO_EM = 0.4;         // EA,OEF with each other
const RHO_EM_ADV = 0.25;    // EM with advanced

const CORR: Record<CountryKey, Record<CountryKey, number>> = {} as Record<CountryKey, Record<CountryKey, number>>;
const ADV: CountryKey[] = ['US', 'EZ', 'JP', 'UK', 'OA'];
const EM: CountryKey[] = ['EA', 'OEF'];

for (const a of COUNTRY_KEYS) {
  CORR[a] = {} as Record<CountryKey, number>;
  for (const b of COUNTRY_KEYS) {
    if (a === b) { CORR[a][b] = 1; continue; }
    if (ADV.includes(a) && ADV.includes(b)) CORR[a][b] = RHO_ADVANCED;
    else if (a === 'CN' || b === 'CN') CORR[a][b] = RHO_CHINA;
    else if (EM.includes(a) && EM.includes(b)) CORR[a][b] = RHO_EM;
    else CORR[a][b] = RHO_EM_ADV;
  }
}

// Cholesky decomposition of the correlation matrix (precomputed approximation)
// We use a simple factor model: z_i = rho_i * common + sqrt(1-rho_i^2) * idio_i
export function generateShocks(
  rng: SeededRNG,
  sigma: number
): Record<CountryKey, number> {
  const common = rng.normal(0, 1);
  const shocks: Record<CountryKey, number> = {} as Record<CountryKey, number>;

  for (const key of COUNTRY_KEYS) {
    let rho: number;
    if (ADV.includes(key)) rho = RHO_ADVANCED;
    else if (key === 'CN') rho = RHO_CHINA;
    else rho = RHO_EM;
    const idio = rng.normal(0, 1);
    shocks[key] = sigma * (rho * common + Math.sqrt(1 - rho * rho) * idio);
  }
  return shocks;
}

// TFP shock: positive = good supply shock; negative = stagflationary
export function generateTfpShocks(
  rng: SeededRNG,
  sigma = 0.003
): Record<CountryKey, number> {
  return generateShocks(rng, sigma);
}
