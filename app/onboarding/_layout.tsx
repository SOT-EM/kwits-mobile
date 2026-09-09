import { Stack, usePathname, useRouter } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader, StepDots } from "@/components/ui";
import { COLORS } from "@/constants/colors";
import { SCREEN_TRANSITION } from "@/constants/navigation";
import { ONBOARDING_SLIDES, ONBOARDING_STEP_COUNT } from "@/constants/onboarding";

export default function OnboardingLayout() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const pathname = usePathname();

    // The header sits outside the Stack on purpose: it is mounted once and
    // outlives the four step routes, which is what lets the progress pill slide
    // from step to step instead of being rebuilt in place on every navigation.
    const current = pathname.split("/").pop();
    const step = Math.max(
        ONBOARDING_SLIDES.findIndex((slide) => slide.segment === current),
        0,
    );

    return (
        <View
            className="flex-1 bg-background"
            style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
            <View className="px-6 pt-2">
                <ScreenHeader
                    // The first step is entered with replace(), so there is no
                    // history behind it and no back button to offer.
                    onBack={step === 0 ? undefined : router.back}
                    center={<StepDots active={step} total={ONBOARDING_STEP_COUNT} />}
                />
            </View>

            <Stack
                screenOptions={{
                    headerShown: false,
                    ...SCREEN_TRANSITION,
                    contentStyle: { backgroundColor: COLORS.background },
                }}
            />
        </View>
    );
}
