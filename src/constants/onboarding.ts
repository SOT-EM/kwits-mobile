import type { OnboardingSlide } from "@/types";

/**
 * Copy for the onboarding steps, in route order. Each app/onboarding/step-*.tsx
 * route renders <OnboardingSlide index={n} /> and reads its content from here,
 * so the four routes share one layout instead of repeating it.
 */
export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    title: "Your identity is verified!",
    segment: "step-one",
    body: "Next, complete the onboarding so you can get started. It takes less than a minute to set up your preferences.",
    next: "/onboarding/step-two",
  },
  {
    title: "Where to next?",
    segment: "step-two",
    body: "Plan the trip, invite the barkada, and figure out the details together. No more FOMO!",
    next: "/onboarding/step-three",
  },
  {
    title: "Split it, don't sweat it.",
    segment: "step-three",
    body: "Scan the receipt and split the bill instantly. Equal shares or exact to the peso!",
    next: "/onboarding/step-four",
  },
  {
    title: "Everyone's settled.",
    segment: "step-four",
    body: "See the proof the moment someone pays you back. No more ghosting!",
    next: null,
  },
];

export const ONBOARDING_STEP_COUNT = ONBOARDING_SLIDES.length;
