import { Easing } from "react-native-reanimated";

import { CONTROL_HEIGHT } from "./sizing";

/**
 * Motion tokens. Tuned so movement is clearly visible but never feels slow:
 * the duration carries the distance, and the easing does the smoothing.
 */
export const DURATION = {
  fast: 160,
  base: 280,
  slow: 420,
} as const;

/**
 * Emphasised curves rather than symmetric ones. Each starts quickly and spends
 * most of its time settling, which reads as deliberate instead of sluggish --
 * a long duration on a near-linear curve just feels laggy.
 */
export const EASE = {
  standard: Easing.bezier(0.2, 0, 0, 1),
  decelerate: Easing.bezier(0.05, 0.7, 0.1, 1),
  accelerate: Easing.bezier(0.3, 0, 0.8, 0.15),
  spring: { damping: 16, stiffness: 120, mass: 1 },
} as const;

export const DISTANCE = {
  sm: 10,
  md: 20,
  lg: 40,
} as const;

/** Gap between consecutive children in a staggered group, in ms. */
export const STAGGER_STEP = 60;

/**
 * Floating pill nav bar. The collapse interpolates these rather than scaling
 * the bar, so the touch targets shrink with the visuals instead of drifting
 * away from them.
 */
const BAR_PADDING_V = { expanded: 6, collapsed: 4 } as const;

/**
 * The bar sits a touch taller than the other controls at rest, since its
 * glyphs need more room around them than a line of text does, and gives that
 * back when it collapses.
 */
const BAR_HEIGHT = { expanded: CONTROL_HEIGHT + 8, collapsed: CONTROL_HEIGHT } as const;

export const PILL_NAV = {
  /** Height of the active indicator. The bar is this plus twice the padding. */
  expandedCircleSize: BAR_HEIGHT.expanded - BAR_PADDING_V.expanded * 2,
  collapsedCircleSize: BAR_HEIGHT.collapsed - BAR_PADDING_V.collapsed * 2,
  expandedPaddingH: 10,
  collapsedPaddingH: 8,
  expandedPaddingV: BAR_PADDING_V.expanded,
  collapsedPaddingV: BAR_PADDING_V.collapsed,
  /**
   * How far the active indicator reaches past its slot on each side, which is
   * what makes it read as a pill rather than a rounded square. The pill's own
   * horizontal padding has to leave room for it.
   */
  expandedOverhang: 6,
  collapsedOverhang: 6,
  /** Between the pill and the action button. */
  expandedGap: 10,
  collapsedGap: 8,
  /** Outer inset: widens as it collapses, which is what narrows the bar. */
  expandedSideMargin: 16,
  collapsedSideMargin: 52,
  /** ms of no interaction before collapsing. */
  idleCollapseDelay: 3000,
} as const;
