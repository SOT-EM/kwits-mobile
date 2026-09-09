import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

/**
 * Returns a value that changes every time the screen regains focus, for use as
 * a `key` on an animated subtree.
 *
 * Reanimated runs `entering` on mount only, and a native stack keeps earlier
 * screens mounted underneath, so navigating back to a screen would otherwise
 * show it fully settled with no animation at all. Re-keying forces the subtree
 * to remount so the entrance plays again on every visit.
 *
 * The first focus is skipped: mounting already plays the animation, and
 * bumping the key there would restart it mid-flight and read as a flicker.
 */
export function useReplayOnFocus() {
  const [replayKey, setReplayKey] = useState(0);
  const hasFocusedOnce = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedOnce.current) {
        hasFocusedOnce.current = true;
        return;
      }
      setReplayKey((current) => current + 1);
    }, []),
  );

  return replayKey;
}
