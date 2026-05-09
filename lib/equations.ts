export interface Equation {
  id: string;
  name: string;
  latex: string;
  description: string;
  tabs: string[];   // which tabs show this equation
}

export const EQUATIONS: Equation[] = [
  {
    id: 'is',
    name: 'IS Curve',
    latex: 'Y = \\bar{A} - b(r - r^*), \\quad \\bar{A} = Y^*',
    description: 'Output is a decreasing function of the real interest rate gap. b is the interest-rate sensitivity of aggregate demand.',
    tabs: ['overview', 'macro'],
  },
  {
    id: 'phillips',
    name: 'Phillips Curve',
    latex: '\\pi_t = \\pi^e_t - \\alpha(u_t - u^*) + \\varepsilon_t',
    description: 'Inflation equals expected inflation minus the disinflation from slack labor markets, plus a cost-push shock.',
    tabs: ['macro', 'overview'],
  },
  {
    id: 'expectations',
    name: 'Adaptive Expectations',
    latex: '\\pi^e_t = \\lambda \\pi_{t-1} + (1 - \\lambda)\\pi^e_{t-1}',
    description: 'Agents update inflation expectations as a weighted average of last period\'s realized inflation and prior expectation.',
    tabs: ['macro'],
  },
  {
    id: 'taylor',
    name: 'Taylor Rule',
    latex: 'i_t = r^* + \\pi^* + \\varphi_\\pi(\\pi_t - \\pi^*) + \\varphi_y \\tilde{y}_t',
    description: 'The central bank sets the nominal rate to stabilize inflation around target and output around potential.',
    tabs: ['macro', 'overview'],
  },
  {
    id: 'okun',
    name: "Okun's Law",
    latex: 'u_t = u^* - \\beta \\tilde{y}_t',
    description: 'Unemployment deviates from the natural rate in proportion to the output gap.',
    tabs: ['macro'],
  },
  {
    id: 'uip',
    name: 'Uncovered Interest Parity',
    latex: 'e_t = e_{t-1} \\cdot \\frac{1 + i^{\\text{world}}/400}{1 + i_t/400}',
    description: 'The exchange rate adjusts so that returns on domestic and foreign assets are equalized (no arbitrage).',
    tabs: ['trade', 'macro'],
  },
  {
    id: 'armington',
    name: 'Armington Trade Shares',
    latex: '\\pi_{ij} = \\frac{(c_j \\cdot \\tau_{ij})^{-\\theta}}{\\sum_k (c_k \\cdot \\tau_{ik})^{-\\theta}}',
    description: 'Country i\'s import share from j depends on cost-adjusted prices and iceberg trade costs τ. θ is the elasticity of substitution.',
    tabs: ['trade'],
  },
  {
    id: 'velocity',
    name: 'Velocity with Reflexivity',
    latex: 'V_t = \\bar{V} \\cdot \\left(1 + \\beta_V \\mathbb{E}_t[\\pi^c]\\right)^{-1}',
    description: 'Money velocity falls when agents expect rising prices under fixed supply — a deflationary-hoarding mechanism.',
    tabs: ['macro', 'overview'],
  },
  {
    id: 'fisher',
    name: 'Fisher Debt-Deflation',
    latex: '\\Delta NW_t = -\\lambda_t \\cdot \\frac{\\Delta P_t}{P_t} + \\nu_{NW}(1 - NW_{t-1})',
    description: 'Unexpected deflation erodes the real value of debt, damaging banking sector net worth and triggering crises.',
    tabs: ['crisis'],
  },
  {
    id: 'lognormal',
    name: 'Log-Normal Income Distribution',
    latex: 'X \\sim \\text{LogNormal}(\\mu, \\sigma^2), \\quad \\text{Gini} = 2\\Phi\\!\\left(\\tfrac{\\sigma}{\\sqrt{2}}\\right) - 1',
    description: 'Income within each country is log-normally distributed. The Gini coefficient has a closed form in terms of σ.',
    tabs: ['distribution'],
  },
  {
    id: 'theil',
    name: 'Theil Decomposition',
    latex: 'T = T_B + T_W, \\quad T_B = \\sum_i s_i \\ln\\!\\frac{s_i}{p_i}',
    description: 'Global inequality decomposes into between-group (T_B, cross-country income gaps) and within-group (T_W) components.',
    tabs: ['distribution'],
  },
  {
    id: 'atkinson',
    name: 'Atkinson Index',
    latex: 'A_\\varepsilon = 1 - \\frac{1}{\\mu}\\!\\left[\\sum_i p_i y_i^{1-\\varepsilon}\\right]^{\\!1/(1-\\varepsilon)}',
    description: 'The Atkinson index (ε=0.5) reflects the social welfare cost of inequality — the fraction of income that could be sacrificed without loss if distributed equally.',
    tabs: ['distribution'],
  },
  {
    id: 'quantity',
    name: 'Quantity Theory',
    latex: 'MV = PY \\implies \\pi \\approx \\mu + \\dot{V} - g',
    description: 'Money growth in excess of real GDP growth and velocity changes translates into inflation. Key channel for fixed-supply architecture.',
    tabs: ['macro'],
  },
  {
    id: 'ces',
    name: 'CES Production Function',
    latex: 'Y = A\\left[\\alpha K^\\rho + (1-\\alpha)L^\\rho\\right]^{1/\\rho}',
    description: 'Constant elasticity of substitution production with TFP factor A. Elasticity σ = 1/(1−ρ), with ρ=0.5 giving σ=2.',
    tabs: ['macro'],
  },
];
