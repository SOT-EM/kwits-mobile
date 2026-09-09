import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TabBar, TAB_BAR_RESERVED_HEIGHT } from "@/components/layout/TabBar";
import { COLORS } from "@/constants/colors";

export default function TabsLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{
                headerShown: false,
                sceneStyle: {
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom + TAB_BAR_RESERVED_HEIGHT,
                    // Without this the scene falls through to React Navigation's
                    // default grey, which is close enough to the bar's own fill
                    // to hide it. Matches what (auth)/_layout.tsx already does.
                    backgroundColor: COLORS.background,
                },
            }}
        >
            <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
            <Tabs.Screen name="trips" options={{ title: "Trips" }} />
            <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        </Tabs>
    );
}
