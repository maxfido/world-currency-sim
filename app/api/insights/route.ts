import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

const ARCH_NAMES: Record<string, string> = {
  fiat: 'Fiat Baseline (discretionary central banks)',
  fixed: 'Fixed Supply (Bitcoin-style, no new issuance)',
  programmatic: 'Programmatic (4%/yr NGDP-targeting rule)',
  reserve: 'Reserve-Backed (partial fiat reserve)',
};

const DIST_NAMES: Record<string, string> = {
  gdp: 'GDP-Proportional',
  population: 'Population-Proportional',
  egalitarian: 'Egalitarian (equal shares)',
  empirical: 'Empirical BTC-style (concentrated in early adopters)',
};

const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States', EZ: 'Eurozone', CN: 'China', JP: 'Japan',
  UK: 'United Kingdom', OA: 'Other Advanced', EA: 'Emerging Asia',
  OEF: 'Other Emerging & Frontier',
};

export async function POST(req: NextRequest) {
  const { architecture, distribution, params, summary } = await req.json();

  const growthLines = Object.entries(summary.avgGrowth as Record<string, number>)
    .map(([k, v]) => `  ${COUNTRY_NAMES[k] ?? k}: ${(v * 12 * 100).toFixed(2)}%/yr`)
    .join('\n');

  const inflationLines = Object.entries(summary.avgInflation as Record<string, number>)
    .map(([k, v]) => `  ${COUNTRY_NAMES[k] ?? k}: ${v.toFixed(2)}%`)
    .join('\n');

  const giniLines = Object.entries(summary.finalGini as Record<string, number>)
    .map(([k, v]) => `  ${COUNTRY_NAMES[k] ?? k}: ${v.toFixed(3)}`)
    .join('\n');

  const crisisLines = Object.entries(summary.crisisFrequency as Record<string, number>)
    .map(([k, v]) => `  ${COUNTRY_NAMES[k] ?? k}: ${(v * 100).toFixed(1)}% of periods`)
    .join('\n');

  const prompt = `You are analyzing results from a global digital currency macroeconomic simulation. Provide clear, simple insights that a curious non-economist can understand.

SIMULATION SETUP:
- Monetary Architecture: ${ARCH_NAMES[architecture] ?? architecture}
- Initial Currency Distribution: ${DIST_NAMES[distribution] ?? distribution}
- Inflation Target: ${params.piStar}%
- Trade Elasticity: ${params.theta}

RESULTS (240 monthly periods = 20 years):

Average Annual GDP Growth by Region:
${growthLines}

Average Annual Inflation by Region:
${inflationLines}

Final Gini Coefficient (0 = perfectly equal, 1 = totally unequal):
${giniLines}

Banking Crisis Frequency:
${crisisLines}

Global Summary:
- Global Gini (cross-country inequality): ${(summary.globalGini as number).toFixed(3)}
- Total Banking Crises Across All Regions: ${summary.totalCrises}
- Average Money Velocity: ${(summary.avgVelocity as number).toFixed(3)}

Provide exactly these five sections. Keep each to 2-4 sentences. Plain prose, no bullet points inside sections. Simple language, no jargon.

## Overall Outcome
[What happened in this simulation at a high level]

## Winners and Losers
[Which regions did best and worst, and the simple reason why]

## What the Monetary Architecture Did
[What the chosen system meant in practice for growth, inflation, and stability]

## Surprising Finding
[One counterintuitive or unexpected result from the data]

## Bottom Line
[One sentence takeaway anyone can understand]`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  return NextResponse.json({ insights: text });
}
