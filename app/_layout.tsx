import "../global.css";

import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { useOnboardingStore } from "../src/lib/onboarding";
import { useAuthStore } from "../src/lib/auth";

export default function RootLayout() {
    const { isReady, hasOnboarded, checkStatus } = useOnboardingStore();
    const restoreSession = useAuthStore((state) => state.restore);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        checkStatus();
        // Rehydrates the stored token so a signed-in session survives a restart.
        restoreSession();
    }, []);

    useEffect(() => {
        if (!isReady) return;
        const inOnboarding = segments[0] === "onboarding";
        if (!hasOnboarded && !inOnboarding) {
            router.replace("/onboarding");
        } else if (hasOnboarded && inOnboarding) {
            router.replace("/(tabs)");
        }
    }, [isReady, hasOnboarded, segments]);

    if (!isReady) return null;

    return (
        <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
    );
}