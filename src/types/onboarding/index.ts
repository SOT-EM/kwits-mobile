import type { Href } from "expo-router";

export interface OnboardingState {
  isReady: boolean;
  hasOnboarded: boolean;
  checkStatus: () => Promise<void>;
  complete: () => Promise<void>;
  /** Clears the flag on sign-out, so the next account sees onboarding again. */
  reset: () => Promise<void>;
}

export interface OnboardingSlide {
  title: string;
  body: string;
  /** Last part of this step's route, used to map a route back to a step index. */
  segment: string;
  /** Route of the following step, or null on the last one, which finishes instead. */
  next: Href | null;
}
