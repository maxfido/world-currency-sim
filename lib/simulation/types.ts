export type Architecture = 'fiat' | 'fixed' | 'programmatic' | 'reserve';
export type Distribution = 'empirical' | 'egalitarian' | 'gdp' | 'population';
export type TabId = 'overview' | 'trade' | 'macro' | 'distribution' | 'crisis' | 'insights';

export const COUNTRY_KEYS = ['US', 'EZ', 'CN', 'JP', 'UK', 'OA', 'EA', 'OEF'] as const;
export type CountryKey = typeof COUNTRY_KEYS[number];

export interface CountryParams {
  key: CountryKey;
  name: string;
  gdpShare: number;       // fraction of world GDP
  popShare: number;       // fraction of world population
  gini0: number;          // initial Gini (0-1)
  trendGrowth: number;    // potential output growth per period (monthly fraction)
  uStar: number;          // NAIRU %
  alpha: number;          // Phillips slope
  beta: number;           // Okun coefficient
  openness: number;       // trade/GDP ratio
  leverage0: number;      // initial banking leverage ratio
  b: number;              // IS slope (sensitivity of output to real rate)
  rStar: number;          // neutral real rate %
  piStar: number;         // inflation target %
}

export interface CountryState {
  key: CountryKey;
  gdp: number;            // index, starts at 100
  inflation: number;      // % annualized
  expectedInflation: number;
  unemployment: number;   // %
  realRate: number;       // %
  nominalRate: number;    // %
  exchangeRate: number;   // vs global currency (index)
  netExports: number;     // % of GDP
  netWorth: number;       // banking sector net worth index
  leverage: number;
  inCrisis: boolean;
  gini: number;
  logMean: number;        // log-normal income distribution mean
  logSigma: number;       // log-normal income distribution std dev
  currencyHoldings: number; // fraction of global digital currency supply
}

export interface GlobalState {
  period: number;
  velocity: number;
  priceLevel: number;     // global average price level
  supplyGrowth: number;   // current period money supply growth rate (annualized %)
  crisisCount: number;
}

export interface CrisisEvent {
  country: CountryKey;
  period: number;
  severity: number;       // 0-1
  type: 'banking' | 'currency' | 'debt';
}

export interface TradeMatrix {
  // trade[i][j] = exports from i to j as fraction of i's GDP
  shares: Record<CountryKey, Record<CountryKey, number>>;
}

export interface Period {
  t: number;
  global: GlobalState;
  countries: Record<CountryKey, CountryState>;
  trade: TradeMatrix;
  crisisEvents: CrisisEvent[];
}

export interface SimResults {
  architecture: Architecture;
  distribution: Distribution;
  seed: number;
  params: SimParams;
  periods: Period[];       // length 241 (t=0..240)
  summary: SummaryStats;
}

export interface SummaryStats {
  // Per country
  avgGrowth: Record<CountryKey, number>;
  avgInflation: Record<CountryKey, number>;
  finalGini: Record<CountryKey, number>;
  crisisFrequency: Record<CountryKey, number>;
  // Global
  globalGini: number;
  theilBetween: number;
  theilWithin: number;
  atkinson: number;
  totalCrises: number;
  avgVelocity: number;
}

export interface SimParams {
  // Monetary
  piStar: number;         // global inflation target %
  rStarWorld: number;     // world neutral real rate %
  lambda: number;         // expectation adaptation speed (0-1)
  // Phillips
  sigmaEps: number;       // inflation shock std dev
  // Taylor
  phiPi: number;          // Taylor inflation coefficient
  phiY: number;           // Taylor output gap coefficient
  // Trade
  theta: number;          // Armington elasticity
  // Banking
  nuNW: number;           // net worth recovery speed
  crisisThreshold: number; // leverage ratio triggering crisis
  // Production
  tfpGrowth: number;      // baseline TFP growth (monthly fraction)
  // Digital currency specific
  supplyGrowthFixed: number;   // 0 for fixed supply
  supplyGrowthProgrammatic: number; // 4% / 12 monthly
  reserveRatio: number;        // fraction of reserve backing
  // Velocity
  betaV: number;          // velocity sensitivity to expected inflation
  vBar: number;           // baseline velocity
}

export const DEFAULT_PARAMS: SimParams = {
  piStar: 2,
  rStarWorld: 2,
  lambda: 0.4,
  sigmaEps: 0.4,
  phiPi: 1.5,
  phiY: 0.5,
  theta: 4,
  nuNW: 0.05,
  crisisThreshold: 12,
  tfpGrowth: 0.002 / 12,
  supplyGrowthFixed: 0,
  supplyGrowthProgrammatic: 4 / 12,
  reserveRatio: 0.3,
  betaV: 0.15,
  vBar: 1.0,
};
