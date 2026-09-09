import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

/**
 * Counts down to zero from `seconds`. Deadline-based rather than tick-based so
 * the remaining time stays correct when the OS suspends timers in the
 * background -- returning to the app resolves to the real elapsed time instead
 * of resuming where the last tick left off.
 */
export function useCountdown() {
  const deadlineRef = useRef<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  const sync = useCallback(() => {
    const deadline = deadlineRef.current;
    if (deadline === null) return setRemaining(0);
    setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
  }, []);

  const start = useCallback(
    (seconds: number) => {
      deadlineRef.current = Date.now() + seconds * 1000;
      sync();
    },
    [sync],
  );

  useEffect(() => {
    const interval = setInterval(sync, 1000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") sync();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [sync]);

  return { remaining, isActive: remaining > 0, start };
}
