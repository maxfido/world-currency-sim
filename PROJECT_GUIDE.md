# Universal Digital Currency Simulation: Project Guide
### Meet Phil

**History of the Digital Economy — Group Project**
Live simulation: https://world-currency-sim.vercel.app
GitHub: https://github.com/maxfido/world-currency-sim

---

## How to Use This Guide

Upload this file to any LLM (Claude, ChatGPT, Gemini, etc.) to load **Phil** — the expert context layer for this simulation. Phil knows the model inside and out: every equation, every parameter, every assumption, and exactly where the model is strong or soft. Ask Phil anything.

Try starting with: *"Hi Phil, I'm working on [topic]. Where should I start?"*

Phil can:

- Explain any equation, parameter, or mechanism in plain English
- Give feedback on a paper you found and whether it's relevant
- Suggest what to read given a specific question you have
- Help you draft a parameter update with proper academic justification
- Critique a model design choice and propose an improvement

**Phil's persona:** an economist who built this model and knows exactly where its assumptions are soft, where they are well-grounded, and what empirical literature would sharpen them.

---

## What This Simulation Does

The model runs a 20-year (240-month) global macroeconomic simulation comparing four architectures for a universal digital currency. It tracks eight country blocs simultaneously and measures how each architecture performs across growth, inflation, unemployment, trade, banking stability, and income inequality.

The four currency architectures are:

| Architecture | What it is | Real-world analog |
|---|---|---|
| **Fiat** | Baseline — countries keep sovereign monetary policy | Current dollar/euro/yuan system |
| **Fixed Supply** | Hard cap on total currency supply, no new issuance | Bitcoin-style deflationary currency |
| **Programmatic** | Supply grows algorithmically to target nominal GDP | NGDP targeting rule (Scott Sumner) |
| **Reserve-Backed** | Supply expands only as hard-asset reserves accumulate | Gold standard / Diem-style stablecoin |

The simulation does not pick a winner. It shows tradeoffs. Your job as contributors is to find literature that either validates or challenges the parameters and mechanisms underneath each architecture.

---

## The Eight Country Blocs

| Key | Name | GDP Share | Pop Share | Initial Gini | Trend Growth |
|---|---|---|---|---|---|
| US | United States | 25.4% | 4.3% | 0.41 | 2.5%/yr |
| EZ | Eurozone | 17.2% | 4.5% | 0.31 | 1.6%/yr |
| CN | China | 18.1% | 17.8% | 0.46 | 4.5%/yr |
| JP | Japan | 6.5% | 1.6% | 0.33 | 1.0%/yr |
| UK | United Kingdom | 4.3% | 0.9% | 0.35 | 1.8%/yr |
| OA | Other Advanced | 8.2% | 3.8% | 0.30 | 2.0%/yr |
| EA | Emerging Asia | 12.1% | 31.5% | 0.38 | 5.5%/yr |
| OEF | Other Emerging & Frontier | 8.2% | 35.6% | 0.45 | 3.5%/yr |

**Where these numbers come from:** World Bank GDP shares, UN population data, LIS/SWIID Gini estimates, IMF World Economic Outlook trend growth estimates. All are approximations and all are open for revision with better sourcing.

---

## The Core Equations

Understanding these equations is the key to knowing what research matters. Every parameter listed is a lever your team can improve with citations.

### 1. IS Curve (Output Determination)

```
Y = Y* - b(r - r*)
```

Each country's output gap depends on how far the real interest rate is from the neutral rate `r*`. The parameter `b` controls how sensitive demand is to rates. Under digital currency architectures, the nominal rate is partially externalized (50% world rate / 50% local Taylor rule), which reduces each country's ability to independently stabilize output. This is the **Mundell-Fleming trilemma** in action.

**What `b` is:** Interest-rate sensitivity of aggregate demand. The US uses 1.5, China 0.8 (less rate-sensitive due to state-directed credit), Emerging Asia 0.7.

### 2. Expectations-Augmented Phillips Curve (Inflation)

```
π_t = π^e_t - α(u_t - u*) + ε_t
```

Inflation equals expected inflation minus the disinflationary effect of unemployment above NAIRU, plus a random supply shock. The `α` coefficient (Phillips slope) varies by country: flatter in China (0.3) and Japan (0.2), steeper in the US (0.5). The flatness of the Phillips curve post-2008 is a major empirical debate in the literature.

### 3. Adaptive Expectations

```
π^e_t = λ * π_{t-1} + (1 - λ) * π^e_{t-1}
```

Agents update their inflation forecasts as a weighted average of last period's actual inflation and their prior belief. The `λ = 0.4` means expectations are somewhat sticky (not purely rational, not purely backward-looking). This is a deliberate simplification — the model does not include forward-looking (rational) expectations.

### 4. Taylor Rule (Monetary Policy)

```
i_t = r* + π* + φπ(π_t - π*) + φy * ỹ_t
```

The central bank sets rates to close the inflation gap and output gap. Under digital currency architectures, this rule is diluted — countries lose full monetary autonomy. The Taylor Principle requires `φπ > 1` (currently 1.5) to ensure stability. `φy = 0.5` is the original Taylor (1993) calibration.

### 5. Okun's Law (Unemployment)

```
u_t = u* - β * ỹ_t
```

Unemployment deviates from NAIRU in proportion to the output gap. `β = 0.5` for the US (well-documented). Emerging markets use lower values (0.3–0.4) reflecting more informal labor markets where output gaps show up in wages and hours rather than measured unemployment.

### 6. Uncovered Interest Parity (Exchange Rates)

```
e_t = e_{t-1} * (1 + i_world/400) / (1 + i_local/400)
```

Exchange rates adjust so arbitrage profits between domestic and foreign bonds are zero. Under fixed-supply architecture, deflation creates real appreciation. Under reserve-backed, a managed float partially stabilizes the rate back toward 1.0 each period.

### 7. Armington Trade Shares (Trade Flows)

```
π_ij = (c_j * τ_ij)^{-θ} / Σ_k (c_k * τ_ik)^{-θ}
```

Country `i`'s import share from `j` depends on `j`'s cost-adjusted price and iceberg trade cost `τ`. The Armington elasticity `θ = 4` governs how quickly trade patterns shift when prices change. Digital currency architectures reduce trade costs over time (adoption ramp over 10 years) — by 8% for fixed, 6% for programmatic, 5% for reserve-backed.

### 8. Velocity with Reflexivity

```
V_t = V̄ / (1 + βv * E[π])
```

Money velocity falls when inflation expectations rise under a fixed-supply currency — the hoarding mechanism. `βv = 0.15` means that at 5% expected inflation, velocity drops ~7%. This is the key mechanism distinguishing Bitcoin-style deflationary currency: hoarding amplifies deflation.

### 9. Fisher Debt-Deflation (Banking Sector)

```
ΔNW_t = -λ_t * (ΔP/P) + ν_NW * (1 - NW_{t-1})
```

Unexpected deflation erodes the real value of nominal debt, damaging bank net worth. When leverage exceeds the crisis threshold (default: 12x), a banking crisis triggers, causing output losses up to 2.5% per month. This is the Minsky-Fisher mechanism. Net worth mean-reverts toward 1.0 at speed `ν_NW = 0.05`.

### 10. Log-Normal Income Distribution

```
Gini = 2Φ(σ/√2) - 1
```

Each country's income distribution is log-normal, parameterized by `(μ, σ)`. The Gini coefficient is an analytical function of `σ`. Fixed-supply architecture increases `σ` for countries with high currency holdings (currency holders benefit from deflation), while banking crises raise `σ` sharply (capital owners are better protected). Global inequality is decomposed via the Theil index into between-country and within-country components.

---

## All Tunable Parameters

These are the levers your team can justify changing with empirical research.

| Parameter | Symbol | Default | What It Controls | Source |
|---|---|---|---|---|
| Inflation Target | π* | 2% | Global price stability anchor | Taylor (1993); Bernanke & Mishkin (1997) |
| World Neutral Real Rate | r* | 2% | Global cost of capital | Laubach & Williams (2003); Holston et al. (2017) |
| Expectations Adaptation | λ | 0.4 | How fast agents update inflation beliefs | Sargent (1971); Fuhrer (1997) |
| Taylor Inflation Coeff. | φπ | 1.5 | Central bank inflation-fighting aggression | Taylor (1993) |
| Taylor Output Coeff. | φy | 0.5 | Central bank growth-weighting | Taylor (1993); Orphanides (2003) |
| Inflation Shock Std Dev | σε | 0.4% | Volatility of supply-side shocks | Smets & Wouters (2007) |
| Trade Elasticity | θ | 4 | Substitutability of goods across borders | Anderson & van Wincoop (2003) |
| Crisis Leverage Threshold | λ̄ | 12x | How fragile the banking system is | Minsky (1986); Reinhart & Rogoff (2009) |
| Net Worth Recovery Speed | ν_NW | 0.05 | How fast banks heal after a crisis | Bernanke, Gertler & Gilchrist (1999) |
| Velocity Sensitivity | βv | 0.15 | Deflationary hoarding strength | Bordo & Jonung (1990); Carstens (2019) |
| Reserve Backing Ratio | ρ | 0.3 | Fraction of digital currency covered by reserves | Diem Association (2019); IMF (2022) |
| TFP Growth | g_A | 2%/yr | Underlying technological progress | Fernald (2015); Gordon (2016) |

---

## The Distribution Scenarios

How digital currency is initially allocated matters enormously for inequality outcomes.

| Scenario | Description | Inspiration |
|---|---|---|
| **Empirical** | US 42%, EZ 18%, JP 12%, UK 9%, CN 8%, OA 7%, EA 3%, OEF 1% | BTC wealth concentration data |
| **GDP-Weighted** | Allocated proportional to GDP share | Neutral/market-cap approach |
| **Population-Weighted** | Allocated by population share | Equity-first design |
| **Egalitarian** | Equal 12.5% to each bloc regardless of size | Pure equal-treatment norm |

The empirical distribution is the most realistic for any bottom-up digital currency adoption. The others are policy design choices. Research on **crypto wealth concentration** (Chainalysis reports, Auer & Böhme 2020) directly informs whether the empirical distribution is calibrated correctly.

---

## Where the Model Is Weak (Research Opportunities)

This is the honest assessment of where the model takes shortcuts and what literature would strengthen it.

### Weakness 1: Flat Phillips Curve
The model uses a country-specific but time-invariant Phillips slope `α`. Post-2008, there is a large empirical literature documenting the flattening of the Phillips curve in advanced economies. Japan's `α = 0.2` gestures at this but is not empirically sourced.

**Papers to find:**
- Blanchard (2016), "The US Phillips Curve: Back to the 60s?" — argues the curve has flattened
- Del Negro et al. (2020), "What's Up with the Phillips Curve?" — FRBNY analysis
- Ball & Mazumder (2011) — documents post-crisis flattening
- Any BIS working papers on global Phillips curve flattening

### Weakness 2: Adaptive vs. Rational Expectations
The model uses adaptive expectations (`λ = 0.4`). This is arguably too backward-looking for forward-looking central bank communication, especially under digital currency where algorithmic supply rules may anchor expectations differently.

**Papers to find:**
- Sims (2003), "Implications of Rational Inattention" — why full rationality isn't right either
- Coibion & Gorodnichenko (2015), "Information Rigidity and the Expectations Formation Process"
- Anything on "anchored expectations" under inflation targeting regimes

### Weakness 3: Trade Cost Reduction Under Digital Currency
The model assumes a fixed 8%/6%/5% reduction in trade costs by architecture, reaching full adoption at t=120 months. These numbers are heuristic. There is now empirical work on settlement frictions and cross-border payment costs.

**Papers to find:**
- IMF Working Papers on CBDC and cross-border payments (Auer, Cornelli, Frost 2020)
- BIS Papers on "mBridge" — the actual multi-CBDC cross-border platform
- World Bank remittance cost data (annual reports) for baseline frictions
- Panetta (2021), ECB, on the digital euro and payment efficiency

### Weakness 4: Velocity of Digital Currency
`βv = 0.15` is calibrated from historical fiat money velocity data (Bordo & Jonung). A fixed-supply digital currency is categorically different — Bitcoin has shown extreme velocity instability. There is almost no empirical literature on this because no fixed-supply currency has operated at global scale.

**Papers to find:**
- Baur & Lucey (2010), "Is Gold a Hedge or a Safe Haven?" — gold as a fixed-supply analog
- Yermack (2015), "Is Bitcoin a Real Currency?" — documents low velocity as medium of exchange
- Carstens (2019), BIS Annual Economic Report, "The Future of Money" — skeptical of crypto velocity
- Historical gold standard velocity data (Eichengreen, Temin)

### Weakness 5: Income Distribution Under Digital Currency
The model uses a log-normal distribution with a simple rule: fixed-supply architecture benefits currency holders and hurts debtors. The actual distributional effects of a global digital currency are much more complex and contested.

**Papers to find:**
- Brunnermeier & Niepelt (2019), "On the Equivalence of Private and Public Money"
- Andolfatto (2021), "Assessing the Impact of Central Bank Digital Currency on Private Banks"
- Auer et al. (2022), "Central Bank Digital Currencies: Motives, Economic Implications and the Research Frontier"
- Piketty (2014) — general inequality dynamics that could anchor distributional assumptions

### Weakness 6: Country-Specific r* (Neutral Rate)
Each country has a fixed `r*`. In reality, `r*` has trended globally (secular stagnation debate) and differs structurally across development levels. Emerging markets have higher neutral rates; Japan's has been near zero.

**Papers to find:**
- Holston, Laubach & Williams (2017) — international estimates of r*
- Rachel & Smith (2017), "Secular Drivers of the Global Real Interest Rate" — Bank of England
- Summers (2014) on secular stagnation — why r* may stay low for advanced economies
- Any IMF Article IV consultations with r* estimates for China or Emerging Asia

### Weakness 7: Banking Sector Leverage and Crisis Calibration
The leverage crisis threshold of 12x is a rough average. Different banking systems have very different leverage norms — Japanese banks are highly leveraged (11x initial), US banks less so post-Dodd-Frank.

**Papers to find:**
- Reinhart & Rogoff (2009), "This Time Is Different" — 800 years of crisis data
- Schularick & Taylor (2012), "Credit Booms Gone Bust" — credit/GDP as crisis predictor
- BIS Annual Reports on global bank leverage (any recent year)
- Basel III documentation on capital requirements — what "safe" leverage looks like regulatorily

---

## How to Contribute: Your Workflow

### Step 1: Pick an assumption or mechanism
Choose one from the weaknesses listed above or from the parameters table. Narrow it to a specific country or equation.

### Step 2: Find a paper
Academic databases: JSTOR, SSRN, NBER Working Papers, BIS Working Papers, IMF eLibrary. Search the paper titles listed above or look at the citing literature.

### Step 3: Read with these questions in mind
- What is the empirically estimated value of the parameter this paper covers?
- Is that estimate stable across time/countries, or context-dependent?
- Is there a confidence interval? Is the current model value inside or outside it?
- Does this paper suggest the mechanism is modeled correctly (e.g., should Phillips curve slope be time-varying)?

### Step 4: Bring your finding to the group
Present: (a) the paper, (b) what the current model assumes, (c) what the paper suggests, (d) whether it would change model behavior significantly.

### Step 5: Update the model
Parameter changes live in two files:
- `lib/simulation/types.ts` — the `DEFAULT_PARAMS` object (global parameters)
- `lib/simulation/countries.ts` — country-specific values (`alpha`, `beta`, `rStar`, `gini0`, etc.)

Each change should come with an updated citation in `lib/assumptions.ts`.

---

## Questions You Can Ask This Guide

Once uploaded to an LLM, here are prompts that will get useful responses:

- "I found a paper arguing the Armington elasticity should be 6, not 4. What does that change in the model?"
- "How does the model handle the Mundell-Fleming trilemma under fixed-supply architecture?"
- "I want to research how CBDCs affect income inequality in emerging markets. What should I read first?"
- "The velocity sensitivity parameter seems too low for a fixed-supply currency. What's the theoretical case for a higher value?"
- "Can you explain how the Fisher debt-deflation mechanism interacts with a fixed-supply currency in the model?"
- "What's the difference between the programmatic and reserve-backed architectures in terms of monetary policy autonomy?"
- "I read that Japan's Phillips curve slope is basically zero. Is α = 0.2 defensible, or should we go lower?"
- "Help me evaluate whether this paper on CBDC cross-border payments is relevant to our trade cost reduction assumption."

---

## Existing Citation Foundation

The model is already grounded in the following literature:

**Monetary Policy:** Taylor (1993), Bernanke & Mishkin (1997), Sargent (1971), Fuhrer (1997), Friedman (1968), Phelps (1968), Orphanides (2003)

**Natural Rate:** Laubach & Williams (2003), Holston et al. (2017)

**Trade:** Anderson & van Wincoop (2003), Head & Mayer (2014), Mundell (1963), Fleming (1962)

**Banking & Crises:** Minsky (1986), Reinhart & Rogoff (2009), Bernanke, Gertler & Gilchrist (1999), Fisher (1933)

**Inequality:** Atkinson (1970), Theil (1967)

**Business Cycles:** Smets & Wouters (2007), Okun (1962)

**Digital Currency:** Nakamoto (2008), Diem Association (2019), IMF (2022)

**Growth:** Fernald (2015), Gordon (2016), Bordo & Jonung (1990)

Your task is to extend or challenge this foundation — either by finding better estimates for existing parameters or by proposing mechanisms the model currently omits entirely.

---

## What the Model Cannot Do (Honest Limits)

- **No agent heterogeneity.** All agents within a country are represented by a single representative agent. Distributional dynamics are approximated analytically, not simulated from micro-level behavior.
- **No political economy.** Adoption of a global digital currency requires geopolitical coordination. The model assumes it happens exogenously.
- **No network effects.** Currency adoption is fixed at initialization (the distribution scenario). In reality, adoption would be endogenous and path-dependent.
- **No financial innovation.** Banking sector behavior is stylized. No shadow banking, no derivatives, no cryptocurrency DeFi dynamics.
- **Expectations are adaptive, not rational.** The model does not solve for forward-looking equilibria.
- **Shocks are i.i.d.** Crises are not correlated across countries except through trade and exchange rate linkages.

These are not flaws to fix — they are deliberate simplifications for a class project. But knowing them lets you honestly bound the claims the simulation can support.

---

*Guide version: May 2026. Simulation codebase: github.com/maxfido/world-currency-sim.*
