import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type { OnboardingState } from "@/types";

const KEY = "hasCompletedOnboarding";

export const useOnboardingStore = create<OnboardingState>((set) => ({
  isReady: false,
  hasOnboarded: false,

  checkStatus: async () => {
    const value = await AsyncStorage.getItem(KEY);
    set({ hasOnboarded: value === "true", isReady: true });
  },

  complete: async () => {
    await AsyncStorage.setItem(KEY, "true");
    set({ hasOnboarded: true });
  },
}));
