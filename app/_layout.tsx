import "../global.css";

import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { SCREEN_TRANSITION } from "@/constants/navigation";
import { useAuthStore } from "@/lib/auth";
import { useOnboardingStore } from "@/lib/onboarding";

export default function RootLayout() {
    const isOnboardingReady = useOnboardingStore((state) => state.isReady);
    const hasOnboarded = useOnboardingStore((state) => state.hasOnboarded);
    const checkStatus = useOnboardingStore((state) => state.checkStatus);

    const isAuthReady = useAuthStore((state) => state.isReady);
    const token = useAuthStore((state) => state.token);
    const pendingVerification = useAuthStore((state) => state.pendingVerification);
    const restoreSession = useAuthStore((state) => state.restore);

    const router = useRouter();
    const segments = useSegments();
    const hasResumed = useRef(false);

    useEffect(() => {
        checkStatus();
        // Rehydrates the stored token so a signed-in session survives a restart.
        restoreSession();
    }, [checkStatus, restoreSession]);

    // Both stores must be settled before routing, or the first frame redirects
    // on a token that has not been read back from storage yet.
    const isReady = isOnboardingReady && isAuthReady;

    useEffect(() => {
        if (!isReady) return;

        const group = segments[0];
        const inAuth = group === "(auth)";
        const inOnboarding = group === "onboarding";

        // Launched with a signup still awaiting its code: drop the user back on
        // Verify. Guarded to the first pass so they can navigate away after.
        if (!hasResumed.current) {
            hasResumed.current = true;
            if (!token && pendingVerification) {
                router.replace("/(auth)/verify-email");
                return;
            }
        }

        if (!token) {
            if (!inAuth) router.replace("/(auth)/welcome");
        } else if (!hasOnboarded) {
            if (!inOnboarding) router.replace("/onboarding");
        } else if (inAuth || inOnboarding) {
            router.replace("/(tabs)");
        }
    }, [isReady, token, hasOnboarded, pendingVerification, segments, router]);

    if (!isReady) return null;

    return (
        <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false, ...SCREEN_TRANSITION }} />
        </SafeAreaProvider>
    );
}
