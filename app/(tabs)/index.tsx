import { Text, ScrollView, Pressable } from "react-native";
import { supabase } from "../../src/lib/supabase";
import { useOnboardingStore } from "@/lib/onboarding";
import AsyncStorage from "@react-native-async-storage/async-storage";

supabase.from("profiles").select("*").then(({ data, error }) => {
    console.log("Supabase test:", { data, error });
});

export default function DashboardScreen() {
    const resetOnboarding = async () => {
        await AsyncStorage.removeItem("hasCompletedOnboarding");
        useOnboardingStore.setState({ hasOnboarded: false });
    };

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: "600" }}>Dashboard</Text>

            <Pressable onPress={resetOnboarding}>
                <Text>Reset onboarding (dev only)</Text>
            </Pressable>
        </ScrollView>
    );
}