'use client';
import { create } from 'zustand';
import type { Architecture, Distribution, SimParams } from '@/lib/simulation/types';
import { DEFAULT_PARAMS } from '@/lib/simulation/types';

interface ScenarioState {
  architecture: Architecture;
  distribution: Distribution;
  params: SimParams;
  seed: number;
  isStale: boolean;
  setArchitecture: (a: Architecture) => void;
  setDistribution: (d: Distribution) => void;
  setParam: (key: keyof SimParams, value: number) => void;
  setSeed: (s: number) => void;
  markFresh: () => void;
}

export const useScenarioStore = create<ScenarioState>((set) => ({
  architecture: 'fiat',
  distribution: 'gdp',
  params: { ...DEFAULT_PARAMS },
  seed: 42,
  isStale: true,

  setArchitecture: (architecture) => set({ architecture, isStale: true }),
  setDistribution: (distribution) => set({ distribution, isStale: true }),
  setParam: (key, value) =>
    set((state) => ({
      params: { ...state.params, [key]: value },
      isStale: true,
    })),
  setSeed: (seed) => set({ seed, isStale: true }),
  markFresh: () => set({ isStale: false }),
}));
