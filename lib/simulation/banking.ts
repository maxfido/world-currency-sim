import type { CountryKey, CountryState, CrisisEvent, SimParams } from './types';

// Net worth evolution: Fisher debt-deflation mechanism
// ΔNW = -leverage * ΔP/P (deflation erodes real debt value → balance sheet damage)
// + income from GDP growth
export function evolveNetWorth(
  prevNW: number,
  leverage: number,
  inflationSurprise: number,   // π - π^e (unexpected deflation is negative)
  gdpGrowth: number,           // % change in GDP this period
  nuNW: number                 // mean-reversion speed
): number {
  // Deflation surprise amplifies debt burden; inflation surprise reduces it
  const fisherEffect = -leverage * (-inflationSurprise / 100) * 0.5;
  const incomeEffect = gdpGrowth / 100 * 0.3;
  const meanReversion = nuNW * (1 - prevNW);  // revert toward NW=1
  const newNW = prevNW + fisherEffect + incomeEffect + meanReversion;
  return Math.max(0.1, Math.min(3.0, newNW));
}

// Leverage: inverse of net worth (simplified: leverage = L0 / NW)
export function updateLeverage(
  leverage0: number,
  netWorth: number
): number {
  return Math.min(30, leverage0 / Math.max(0.1, netWorth));
}

// Banking crisis: triggered when leverage exceeds threshold
// OR when real asset values collapse (deep deflation)
export function detectCrisis(
  key: CountryKey,
  t: number,
  leverage: number,
  netWorth: number,
  inflation: number,
  prevInCrisis: boolean,
  crisisThreshold: number
): CrisisEvent | null {
  // Hysteresis: once in crisis, harder to escape
  if (prevInCrisis && leverage > crisisThreshold * 0.7) return null; // still in crisis, no new event

  if (leverage > crisisThreshold || (netWorth < 0.4 && inflation < -0.5)) {
    const severity = Math.min(1, (leverage - crisisThreshold + 3) / 6);
    const type: CrisisEvent['type'] = leverage > crisisThreshold ? 'banking' : 'currency';
    return { country: key, period: t, severity, type };
  }
  return null;
}

// Crisis impact on GDP growth: output loss proportional to severity
export function crisisOutputLoss(severity: number, inCrisis: boolean): number {
  if (!inCrisis) return 0;
  return -severity * 2.5;  // up to -2.5% output loss per period during crisis
}

// Banking crisis recovery: leverage gradually normalizes
export function crisisRecovery(
  leverage: number,
  netWorth: number,
  inCrisis: boolean,
  leverage0: number
): boolean {
  // Exit crisis when leverage returns near initial value and NW recovers
  return inCrisis && leverage < leverage0 * 1.5 && netWorth > 0.7;
}
