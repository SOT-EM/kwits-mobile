import { Children, type ReactNode } from "react";
import Animated, { FadeInUp } from "react-native-reanimated";

import { DURATION, EASE, STAGGER_STEP } from "@/constants/motion";

interface StaggerProps {
  children: ReactNode;
  /** Delay added per child, in ms. */
  step?: number;
  /** Delay before the first child animates, in ms. */
  initialDelay?: number;
  /** Change this to replay the stagger, e.g. from useReplayOnFocus(). */
  replayKey?: number;
}

/**
 * Fades and lifts each child in turn, so a form settles in rather than
 * appearing all at once. Children keep their position in the parent layout, so
 * an enclosing `gap-*` still applies between them.
 *
 * Reanimated layout animations default to ReduceMotion.System, so this is
 * skipped automatically when the OS has reduced motion enabled.
 */
export function Stagger({
  children,
  step = STAGGER_STEP,
  initialDelay = 0,
  replayKey = 0,
}: StaggerProps) {
  return (
    <>
      {Children.toArray(children).map((child, index) => (
        <Animated.View
          key={`${replayKey}-${index}`}
          entering={FadeInUp.duration(DURATION.base)
            .easing(EASE.decelerate)
            .delay(initialDelay + index * step)}
        >
          {child}
        </Animated.View>
      ))}
    </>
  );
}
