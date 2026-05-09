import type { Architecture, CountryKey, CountryState, SimParams } from './types';
import { COUNTRIES } from './countries';

// Taylor Rule: i^TR = r* + π* + φπ(π - π*) + φy·gap
export function taylorRate(
  inflation: number,
  outputGap: number,
  rStar: number,
  piStar: number,
  phiPi: number,
  phiY: number
): number {
  return Math.max(0, rStar + piStar + phiPi * (inflation - piStar) + phiY * outputGap);
}

// Velocity with reflexivity: V_t = V̄ * (1 + βv * E[π])^{-1}
export function computeVelocity(
  expectedInflation: number,
  vBar: number,
  betaV: number
): number {
  return vBar / (1 + betaV * Math.max(0, expectedInflation / 100));
}

// Money supply growth rate (annualized %) by architecture
export function moneySupplyGrowth(
  architecture: Architecture,
  ngdpGap: number,          // % deviation of NGDP from target (programmatic)
  params: SimParams
): number {
  switch (architecture) {
    case 'fiat':
      // Central bank discretion: targets inflation via Taylor-ish rule
      return params.piStar + 2.0;  // rough quantity theory: M grows at π* + trend
    case 'fixed':
      return params.supplyGrowthFixed;  // 0: no new issuance
    case 'programmatic':
      // NGDP targeting: adjusts supply to close NGDP gap
      const base = params.supplyGrowthProgrammatic;
      const correction = Math.max(-2, Math.min(2, -0.5 * ngdpGap));
      return Math.max(0, base + correction);
    case 'reserve':
      // Backed by reserve: supply grows as reserves grow (endogenous)
      return params.reserveRatio * (params.piStar + 2.0);
  }
}

// Inflation channel from money: π_money = (μ - μ*) / 12, annualized
// μ: actual supply growth, μ*: neutral (matches real growth)
export function moneyInflationEffect(
  supplyGrowthAnnualized: number,
  realGrowthAnnualized: number
): number {
  // Quantity theory approximation
  return (supplyGrowthAnnualized - realGrowthAnnualized) / 12;
}

// Expectations-augmented Phillips Curve
// π = π^e - α(u - u*) + ε
export function phillipsCurve(
  expectedInflation: number,
  unemployment: number,
  uStar: number,
  alpha: number,
  shock: number
): number {
  return expectedInflation - alpha * (unemployment - uStar) + shock;
}

// Adaptive expectations: π^e_t = λ * π_{t-1} + (1-λ) * π^e_{t-1}
export function adaptExpectations(
  prevExpected: number,
  prevActual: number,
  lambda: number
): number {
  return lambda * prevActual + (1 - lambda) * prevExpected;
}

// IS curve: Y = Ā - b * r,  where Ā = Y* + b * r*
// Returns output gap (%) given real rate
export function isOutputGap(
  realRate: number,
  rStar: number,
  b: number
): number {
  // At r = r*, gap = 0; each 1pp above r* reduces output by b units from 100
  return -b * (realRate - rStar);
}

// Okun's Law: u = u* - β * gap
export function okun(gap: number, uStar: number, beta: number): number {
  return Math.max(0, Math.min(25, uStar - beta * gap));
}

// UIP exchange rate update: e_t = e_{t-1} * (1 + i_world/400) / (1 + i/400)
export function uipExchangeRate(
  prevRate: number,
  nominalRate: number,
  worldRate: number
): number {
  return prevRate * (1 + worldRate / 400) / (1 + nominalRate / 400);
}

// Under fixed supply: real exchange rate appreciation = price level differential
// Under reserve-backed: exchange rate stabilized to global basket
export function architectureExchangeAdjust(
  rate: number,
  architecture: Architecture,
  localInflation: number,
  globalInflation: number
): number {
  if (architecture === 'fiat') return rate;
  if (architecture === 'fixed') {
    // Deflation from fixed supply creates real appreciation
    const realAdjust = 1 + (globalInflation - localInflation) / 1200;
    return rate * realAdjust;
  }
  if (architecture === 'reserve') {
    // Managed float: partial stabilization
    const target = 1.0;
    return rate + 0.1 * (target - rate);
  }
  return rate; // programmatic: let UIP work
}

// Net export adjustment from exchange rate and output gap
export function netExportsDelta(
  exchangeRate: number,          // vs baseline (1 = no change)
  outputGap: number,             // %
  gamma = 0.5,
  delta = 0.3
): number {
  return gamma * (exchangeRate - 1) * 10 - delta * outputGap;
}

// Global weighted average inflation
export function globalInflation(inflations: Record<CountryKey, number>): number {
  const countries = COUNTRIES;
  let w = 0;
  let sum = 0;
  for (const key of Object.keys(inflations) as CountryKey[]) {
    const share = countries[key].gdpShare;
    sum += inflations[key] * share;
    w += share;
  }
  return w > 0 ? sum / w : 0;
}
