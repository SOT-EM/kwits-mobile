/**
 * Route transition shared by every navigator.
 *
 * The gate in app/_layout.tsx moves between sections with replace(), which
 * defaults to the backwards "pop" animation, so replacements are forced to read
 * as forward -- otherwise finishing onboarding animates as if going back into
 * the dashboard.
 */
export const SCREEN_TRANSITION = {
  animation: "slide_from_right",
  animationTypeForReplace: "push",
} as const;
