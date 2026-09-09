import { useRouter } from "expo-router";
import { useCallback, useState } from "react";

import { ONBOARDING_SLIDES } from "@/constants/onboarding";
import { useOnboardingStore } from "@/lib/onboarding";

/**
 * Routing and completion for one onboarding step, kept out of the shared slide
 * component so the four step routes stay declarative.
 */
export function useOnboardingFlow(index: number) {
  const router = useRouter();
  const complete = useOnboardingStore((state) => state.complete);
  const [isFinishing, setIsFinishing] = useState(false);

  const slide = ONBOARDING_SLIDES[index];
  const isLast = index === ONBOARDING_SLIDES.length - 1;

  // Marking onboarding done is enough: the root layout reacts to the flag and
  // moves the user to the tabs.
  const finish = useCallback(async () => {
    setIsFinishing(true);
    try {
      await complete();
    } finally {
      setIsFinishing(false);
    }
  }, [complete]);

  const goNext = useCallback(() => {
    if (slide.next) {
      router.push(slide.next);
      return;
    }
    void finish();
  }, [slide, router, finish]);

  return {
    slide,
    isLast,
    isFinishing,
    goNext,
    skip: () => void finish(),
  };
}
