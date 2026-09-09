import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants/colors";
import { SCREEN_TRANSITION } from "@/constants/navigation";

export default function AuthLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                ...SCREEN_TRANSITION,
                contentStyle: {
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                    backgroundColor: COLORS.background,
                },
            }}
        />
    );
}
