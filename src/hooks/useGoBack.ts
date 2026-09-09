import { useRouter, type Href } from "expo-router";
import { useCallback } from "react";

/**
 * router.back() with a fallback, for screens that can also be entered without
 * history behind them -- a deep link, or the launch-time resume onto Verify.
 */
export function useGoBack(fallback: Href) {
  const router = useRouter();

  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(fallback);
  }, [router, fallback]);
}
