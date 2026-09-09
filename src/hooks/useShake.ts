import { useCallback } from "react";
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { DISTANCE } from "@/constants/motion";

const STEP_DURATION = 50;
const SETTLE = DISTANCE.sm * 0.75;

/** Horizontal shake drawing attention to a field that just failed validation. */
export function useShake() {
  const offset = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  const trigger = useCallback(() => {
    if (reduceMotion) return;
    offset.value = withSequence(
      withTiming(-DISTANCE.sm, { duration: STEP_DURATION }),
      withTiming(DISTANCE.sm, { duration: STEP_DURATION }),
      withTiming(-SETTLE, { duration: STEP_DURATION }),
      withTiming(SETTLE, { duration: STEP_DURATION }),
      withTiming(0, { duration: STEP_DURATION }),
    );
  }, [offset, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return { style, trigger };
}
