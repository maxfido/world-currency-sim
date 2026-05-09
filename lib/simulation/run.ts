import type {
  Architecture, Distribution, SimParams, SimResults, Period,
  CountryState, GlobalState, CrisisEvent, TradeMatrix
} from './types';
import { COUNTRY_KEYS, DEFAULT_PARAMS } from './types';
import { COUNTRIES, getInitialHoldings } from './countries';
import { SeededRNG, generateShocks, generateTfpShocks } from './shocks';
import { computeTradeMatrix, computeNetExports } from './trade';
import {
  taylorRate, computeVelocity, moneySupplyGrowth, phillipsCurve,
  adaptExpectations, isOutputGap, okun, uipExchangeRate,
  architectureExchangeAdjust, globalInflation
} from './monetary';
import { evolveNetWorth, updateLeverage, detectCrisis, crisisOutputLoss, crisisRecovery } from './banking';
import { sigmaFromGini, updateDistribution, globalGiniFromCountries } from './distribution';

export const PERIODS = 240;

function initCountries(
  distribution: Distribution,
  params: SimParams
): Record<string, CountryState> {
  const holdings = getInitialHoldings(distribution);
  const states: Record<string, CountryState> = {};

  for (const key of COUNTRY_KEYS) {
    const cp = COUNTRIES[key];
    states[key] = {
      key,
      gdp: 100,
      inflation: cp.piStar,
      expectedInflation: cp.piStar,
      unemployment: cp.uStar,
      realRate: cp.rStar,
      nominalRate: cp.rStar + cp.piStar,
      exchangeRate: 1.0,
      netExports: 0,
      netWorth: 1.0,
      leverage: cp.leverage0,
      inCrisis: false,
      gini: cp.gini0,
      logMean: 3.5,
      logSigma: sigmaFromGini(cp.gini0),
      currencyHoldings: holdings[key],
    };
  }
  return states;
}

export function runSimulation(
  architecture: Architecture,
  distribution: Distribution,
  params: SimParams = DEFAULT_PARAMS,
  seed: number = 42
): SimResults {
  const rng = new SeededRNG(seed);
  const periods: Period[] = [];

  let countryStates = initCountries(distribution, params) as Record<string, CountryState>;
  let globalVelocity = params.vBar;
  let globalPriceLevel = 1.0;
  let totalCrises = 0;

  // t=0 snapshot
  const t0Countries = { ...countryStates } as Record<string, CountryState>;
  const t0Trade = computeTradeMatrix(
    Object.fromEntries(COUNTRY_KEYS.map(k => [k, 1.0])) as Record<string, number>,
    architecture, params.theta, 0
  );
  periods.push({
    t: 0,
    global: { period: 0, velocity: globalVelocity, priceLevel: globalPriceLevel, supplyGrowth: 2, crisisCount: 0 },
    countries: t0Countries as unknown as Record<string, CountryState>,
    trade: t0Trade,
    crisisEvents: [],
  });

  for (let t = 1; t <= PERIODS; t++) {
    const tfpShocks = generateTfpShocks(rng);
    const inflShocks = generateShocks(rng, params.sigmaEps);
    const crisisEvents: CrisisEvent[] = [];
    const newStates: Record<string, CountryState> = {};

    // 1. Compute global weighted inflation for UIP
    const prevInflations = Object.fromEntries(COUNTRY_KEYS.map(k => [k, countryStates[k].inflation])) as Record<string, number>;
    const glbInfl = globalInflation(prevInflations as Record<string, number>);

    // 2. Velocity update
    const avgExpInfl = COUNTRY_KEYS.reduce((s, k) => s + countryStates[k].expectedInflation * COUNTRIES[k].gdpShare, 0);
    globalVelocity = computeVelocity(avgExpInfl, params.vBar, params.betaV);

    // 3. Money supply growth for this period
    const prevGdps = Object.fromEntries(COUNTRY_KEYS.map(k => [k, countryStates[k].gdp])) as Record<string, number>;
    const worldNGDP = COUNTRY_KEYS.reduce((s, k) => s + prevGdps[k] * COUNTRIES[k].gdpShare, 0);
    const ngdpGap = (worldNGDP - 100) / 100 * 100; // % gap from initial
    const supplyGrowth = moneySupplyGrowth(architecture, ngdpGap, params);

    // 4. Trade matrix
    const priceLevels = Object.fromEntries(COUNTRY_KEYS.map(k => [k, globalPriceLevel * (1 + (countryStates[k].inflation - glbInfl) / 1200)])) as Record<string, number>;
    const trade = computeTradeMatrix(priceLevels as Record<string, number>, architecture, params.theta, t);

    // 5. Evolve each country
    for (const key of COUNTRY_KEYS) {
      const prev = countryStates[key];
      const cp = COUNTRIES[key];

      // TFP-augmented growth
      const tfp = tfpShocks[key];
      const trendGDP = prev.gdp * (1 + cp.trendGrowth + tfp);

      // Output gap from IS curve
      const gap = isOutputGap(prev.realRate, cp.rStar, cp.b);

      // Crisis output loss
      const crisisLoss = crisisOutputLoss(prev.leverage > params.crisisThreshold ? 0.5 : 0, prev.inCrisis);

      // GDP
      const gdp = Math.max(50, trendGDP * (1 + gap / 100) + crisisLoss);

      // Net exports from trade matrix
      const gdpMap = Object.fromEntries(COUNTRY_KEYS.map(k => [k, newStates[k]?.gdp ?? prevGdps[k]])) as Record<string, number>;
      gdpMap[key] = gdp;
      const nx = computeNetExports(key, trade, gdpMap as Record<string, number>);

      // Money inflation effect
      const realGrowthAnn = (gdp / prev.gdp - 1) * 12 * 100;
      const moneyInfl = (supplyGrowth - realGrowthAnn) / 12;

      // Phillips curve
      const unemp = okun(gap, cp.uStar, cp.beta);
      const inflation = phillipsCurve(
        prev.expectedInflation,
        unemp,
        cp.uStar,
        cp.alpha,
        inflShocks[key]
      ) + moneyInfl;

      // Adaptive expectations
      const expectedInflation = adaptExpectations(prev.expectedInflation, prev.inflation, params.lambda);

      // Taylor rule → nominal rate
      const trRate = taylorRate(inflation, gap, cp.rStar, cp.piStar, params.phiPi, params.phiY);
      // Under fixed/programmatic: no independent monetary policy → rate is world rate
      let nominalRate: number;
      if (architecture === 'fiat') {
        nominalRate = trRate;
      } else {
        // Digital currency: rate partially determined externally
        const worldNominal = params.rStarWorld + params.piStar;
        nominalRate = 0.5 * trRate + 0.5 * worldNominal;
      }
      const realRate = nominalRate - expectedInflation;

      // Exchange rate (UIP)
      const worldRate = params.rStarWorld + glbInfl;
      let exRate = uipExchangeRate(prev.exchangeRate, nominalRate, worldRate);
      exRate = architectureExchangeAdjust(exRate, architecture, inflation, glbInfl);
      exRate = Math.max(0.3, Math.min(3.0, exRate));

      // Banking
      const inflSurprise = inflation - prev.expectedInflation;
      const gdpGrowthPct = (gdp / prev.gdp - 1) * 100;
      const netWorth = evolveNetWorth(prev.netWorth, prev.leverage, inflSurprise, gdpGrowthPct, params.nuNW);
      const leverage = updateLeverage(cp.leverage0, netWorth);

      // Crisis detection
      const crisis = detectCrisis(key, t, leverage, netWorth, inflation, prev.inCrisis, params.crisisThreshold);
      if (crisis) { crisisEvents.push(crisis); totalCrises++; }

      const inCrisis = crisis !== null || (prev.inCrisis && !crisisRecovery(leverage, netWorth, prev.inCrisis, cp.leverage0));

      // Distribution
      const dist = updateDistribution(prev.logMean, prev.logSigma, gdpGrowthPct, architecture, inCrisis, prev.currencyHoldings);

      newStates[key] = {
        key,
        gdp,
        inflation: Math.max(-5, Math.min(30, inflation)),
        expectedInflation: Math.max(-3, Math.min(20, expectedInflation)),
        unemployment: unemp,
        realRate: Math.max(-5, Math.min(20, realRate)),
        nominalRate: Math.max(0, Math.min(25, nominalRate)),
        exchangeRate: exRate,
        netExports: Math.max(-15, Math.min(15, nx)),
        netWorth,
        leverage,
        inCrisis,
        gini: Math.max(0.15, Math.min(0.75, giniFromSigmaLocal(dist.logSigma))),
        logMean: dist.logMean,
        logSigma: dist.logSigma,
        currencyHoldings: prev.currencyHoldings, // constant in this model
      };
    }

    // Update global price level
    const newInflation = COUNTRY_KEYS.reduce((s, k) => s + newStates[k].inflation * COUNTRIES[k].gdpShare, 0);
    globalPriceLevel *= (1 + newInflation / 1200);

    countryStates = newStates;

    periods.push({
      t,
      global: {
        period: t,
        velocity: globalVelocity,
        priceLevel: globalPriceLevel,
        supplyGrowth,
        crisisCount: crisisEvents.length,
      },
      countries: { ...newStates } as unknown as Record<string, CountryState>,
      trade,
      crisisEvents,
    });
  }

  // Summary statistics
  const finalPeriod = periods[PERIODS];
  const summary = computeSummary(periods);

  return {
    architecture,
    distribution,
    seed,
    params,
    periods: periods as Period[],
    summary,
  };
}

function giniFromSigmaLocal(sigma: number): number {
  const x = sigma / Math.sqrt(2);
  const a = 0.147;
  const sign = x >= 0 ? 1 : -1;
  const v = Math.sqrt(1 - Math.exp(-x * x * (4 / Math.PI + a * x * x) / (1 + a * x * x)));
  return Math.max(0, Math.min(1, 2 * (0.5 * (1 + sign * v)) - 1));
}

function computeSummary(periods: Period[]): SimResults['summary'] {
  const avgGrowth: Record<string, number> = {};
  const avgInflation: Record<string, number> = {};
  const finalGini: Record<string, number> = {};
  const crisisFrequency: Record<string, number> = {};

  const last = periods[periods.length - 1];
  let totalCrises = 0;
  let velocitySum = 0;

  for (const key of COUNTRY_KEYS) {
    const gdps = periods.map(p => p.countries[key].gdp);
    const infls = periods.map(p => p.countries[key].inflation);
    const crisisCount = periods.reduce((s, p) => s + (p.crisisEvents.filter(e => e.country === key).length), 0);

    avgGrowth[key] = periods.length > 1
      ? ((gdps[gdps.length - 1] / gdps[0]) ** (12 / PERIODS) - 1) * 100
      : 0;
    avgInflation[key] = infls.slice(1).reduce((s, v) => s + v, 0) / (infls.length - 1);
    finalGini[key] = last.countries[key].gini;
    crisisFrequency[key] = crisisCount / PERIODS;
    totalCrises += crisisCount;
  }

  for (const p of periods) velocitySum += p.global.velocity;

  const countryStateList = COUNTRY_KEYS.map(k => last.countries[k]);
  const { gini: globalGini, theilBetween, theilWithin, atkinson } = globalGiniFromCountries(countryStateList);

  return {
    avgGrowth: avgGrowth as Record<string, number>,
    avgInflation: avgInflation as Record<string, number>,
    finalGini: finalGini as Record<string, number>,
    crisisFrequency: crisisFrequency as Record<string, number>,
    globalGini,
    theilBetween,
    theilWithin,
    atkinson,
    totalCrises,
    avgVelocity: velocitySum / periods.length,
  };
}
