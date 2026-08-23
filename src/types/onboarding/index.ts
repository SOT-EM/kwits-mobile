export interface OnboardingState {
  isReady: boolean;
  hasOnboarded: boolean;
  checkStatus: () => Promise<void>;
  complete: () => Promise<void>;
}
