'use client';
import { create } from 'zustand';
import type { SimResults, TabId } from '@/lib/simulation/types';

interface ResultsState {
  results: SimResults | null;
  isRunning: boolean;
  focusedTab: TabId;
  period: number;           // selected period for cross-section views
  focusedCountry: string;
  aiInsights: string | null;
  isLoadingInsights: boolean;
  setResults: (r: SimResults) => void;
  setRunning: (v: boolean) => void;
  setTab: (t: TabId) => void;
  setPeriod: (p: number) => void;
  setFocusedCountry: (k: string) => void;
  setAiInsights: (text: string | null) => void;
  setLoadingInsights: (v: boolean) => void;
}

export const useResultsStore = create<ResultsState>((set) => ({
  results: null,
  isRunning: false,
  focusedTab: 'overview',
  period: 240,
  focusedCountry: 'US',
  aiInsights: null,
  isLoadingInsights: false,

  setResults: (results) => set({ results, aiInsights: null }),
  setRunning: (isRunning) => set({ isRunning }),
  setTab: (focusedTab) => set({ focusedTab }),
  setPeriod: (period) => set({ period }),
  setFocusedCountry: (focusedCountry) => set({ focusedCountry }),
  setAiInsights: (aiInsights) => set({ aiInsights }),
  setLoadingInsights: (isLoadingInsights) => set({ isLoadingInsights }),
}));
