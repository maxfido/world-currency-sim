import type { CountryKey, CountryParams } from './types';

export const COUNTRIES: Record<CountryKey, CountryParams> = {
  US: {
    key: 'US',
    name: 'United States',
    gdpShare: 0.254,
    popShare: 0.043,
    gini0: 0.41,
    trendGrowth: 0.025 / 12,
    uStar: 4.5,
    alpha: 0.5,
    beta: 0.5,
    openness: 0.27,
    leverage0: 8,
    b: 1.5,
    rStar: 2.0,
    piStar: 2.0,
  },
  EZ: {
    key: 'EZ',
    name: 'Eurozone',
    gdpShare: 0.172,
    popShare: 0.045,
    gini0: 0.31,
    trendGrowth: 0.016 / 12,
    uStar: 6.5,
    alpha: 0.4,
    beta: 0.4,
    openness: 0.46,
    leverage0: 9,
    b: 1.2,
    rStar: 1.5,
    piStar: 2.0,
  },
  CN: {
    key: 'CN',
    name: 'China',
    gdpShare: 0.181,
    popShare: 0.178,
    gini0: 0.46,
    trendGrowth: 0.045 / 12,
    uStar: 5.0,
    alpha: 0.3,
    beta: 0.3,
    openness: 0.37,
    leverage0: 10,
    b: 0.8,
    rStar: 3.5,
    piStar: 3.0,
  },
  JP: {
    key: 'JP',
    name: 'Japan',
    gdpShare: 0.065,
    popShare: 0.016,
    gini0: 0.33,
    trendGrowth: 0.01 / 12,
    uStar: 3.0,
    alpha: 0.2,
    beta: 0.3,
    openness: 0.35,
    leverage0: 11,
    b: 1.0,
    rStar: 0.5,
    piStar: 2.0,
  },
  UK: {
    key: 'UK',
    name: 'United Kingdom',
    gdpShare: 0.043,
    popShare: 0.009,
    gini0: 0.35,
    trendGrowth: 0.018 / 12,
    uStar: 5.0,
    alpha: 0.45,
    beta: 0.45,
    openness: 0.52,
    leverage0: 9,
    b: 1.3,
    rStar: 2.0,
    piStar: 2.0,
  },
  OA: {
    key: 'OA',
    name: 'Other Advanced',
    gdpShare: 0.082,
    popShare: 0.038,
    gini0: 0.30,
    trendGrowth: 0.02 / 12,
    uStar: 5.5,
    alpha: 0.4,
    beta: 0.4,
    openness: 0.55,
    leverage0: 8,
    b: 1.2,
    rStar: 1.8,
    piStar: 2.0,
  },
  EA: {
    key: 'EA',
    name: 'Emerging Asia',
    gdpShare: 0.121,
    popShare: 0.315,
    gini0: 0.38,
    trendGrowth: 0.055 / 12,
    uStar: 6.0,
    alpha: 0.35,
    beta: 0.35,
    openness: 0.60,
    leverage0: 7,
    b: 0.7,
    rStar: 4.5,
    piStar: 4.0,
  },
  OEF: {
    key: 'OEF',
    name: 'Other Emerging & Frontier',
    gdpShare: 0.082,
    popShare: 0.356,
    gini0: 0.45,
    trendGrowth: 0.035 / 12,
    uStar: 7.0,
    alpha: 0.45,
    beta: 0.4,
    openness: 0.50,
    leverage0: 6,
    b: 0.6,
    rStar: 5.5,
    piStar: 5.0,
  },
};

export const COUNTRY_LIST = Object.values(COUNTRIES);

// Initial digital currency holdings by distribution scenario
export function getInitialHoldings(
  distribution: 'empirical' | 'egalitarian' | 'gdp' | 'population'
): Record<CountryKey, number> {
  switch (distribution) {
    case 'empirical': {
      // BTC-inspired: highly concentrated in US/OA (early adopters)
      return { US: 0.42, EZ: 0.18, CN: 0.08, JP: 0.12, UK: 0.09, OA: 0.07, EA: 0.03, OEF: 0.01 };
    }
    case 'egalitarian': {
      const n = 8;
      const share = 1 / n;
      const r: Record<CountryKey, number> = {} as Record<CountryKey, number>;
      for (const c of Object.values(COUNTRIES)) r[c.key] = share;
      return r;
    }
    case 'gdp': {
      const r: Record<CountryKey, number> = {} as Record<CountryKey, number>;
      for (const c of Object.values(COUNTRIES)) r[c.key] = c.gdpShare;
      return r;
    }
    case 'population': {
      const r: Record<CountryKey, number> = {} as Record<CountryKey, number>;
      for (const c of Object.values(COUNTRIES)) r[c.key] = c.popShare;
      return r;
    }
  }
}
