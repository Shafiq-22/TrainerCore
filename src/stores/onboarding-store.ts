import { create } from 'zustand';
import type { PlanTier } from '@/types';

export interface OnboardingData {
  fullName: string;
  phone: string;
  avatarUrl: string;
  businessName: string;
  vatNumber: string;
  vatRegistered: boolean;
  plan: PlanTier;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientGoal: string;
}

const initialData: OnboardingData = {
  fullName: '',
  phone: '',
  avatarUrl: '',
  businessName: '',
  vatNumber: '',
  vatRegistered: false,
  plan: 'starter',
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  clientGoal: '',
};

interface OnboardingState {
  step: number;
  data: OnboardingData;
  setStep: (step: number) => void;
  next: () => void;
  prev: () => void;
  update: (patch: Partial<OnboardingData>) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  data: initialData,
  setStep: (step) => set({ step }),
  next: () => set((s) => ({ step: Math.min(s.step + 1, 4) })),
  prev: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),
  update: (patch) => set((s) => ({ data: { ...s.data, ...patch } })),
  reset: () => set({ step: 1, data: initialData }),
}));
