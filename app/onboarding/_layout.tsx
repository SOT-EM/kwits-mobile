// app/onboarding/_layout.tsx
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OnboardingLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    paddingTop: insets.top,
                },
            }}
        />
    );
}