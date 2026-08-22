import { Text, ScrollView, Pressable, View, ActivityIndicator } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useOnboardingStore } from "@/lib/onboarding";
import { useAuthStore } from "@/lib/auth";
import { api, ApiError, type TravelPlanResponse } from "@/lib/api";

export default function DashboardScreen() {
    const router = useRouter();
    const { token, isReady, logout } = useAuthStore();

    const [plans, setPlans] = useState<TravelPlanResponse[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Proof of the full chain: mobile -> kwits-api -> Postgres, authenticated with
    // the token kwits-api handed back at login.
    const loadPlans = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            setPlans(await api.getPlans(token));
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                // Token expired or was rejected: drop it so the user can sign in again.
                await logout();
                setError("Your session expired. Please sign in again.");
            } else {
                setError(err instanceof ApiError ? err.message : "Could not load plans.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [token, logout]);

    useEffect(() => {
        if (isReady) loadPlans();
    }, [isReady, loadPlans]);

    const resetOnboarding = async () => {
        await AsyncStorage.removeItem("hasCompletedOnboarding");
        useOnboardingStore.setState({ hasOnboarded: false });
    };

    return (
        <ScrollView className="flex-1" contentContainerClassName="p-4">
            <Text className="text-xl font-semibold">Dashboard</Text>

            <Text className="mt-6 font-medium">Your plans</Text>

            {!token ? (
                <View className="mt-2">
                    <Text className="text-neutral-500">You are not signed in.</Text>
                    <Pressable
                        onPress={() => router.push("/(auth)/login")}
                        className="mt-3 self-start rounded-xl bg-neutral-900 px-4 py-3"
                    >
                        <Text className="text-white">Sign in</Text>
                    </Pressable>
                </View>
            ) : isLoading ? (
                <ActivityIndicator className="mt-4 self-start" />
            ) : error ? (
                <View className="mt-2">
                    <Text className="text-red-600">{error}</Text>
                    <Pressable
                        onPress={loadPlans}
                        className="mt-3 self-start rounded-xl bg-neutral-900 px-4 py-3"
                    >
                        <Text className="text-white">Retry</Text>
                    </Pressable>
                </View>
            ) : plans && plans.length > 0 ? (
                plans.map((plan) => (
                    <View key={plan.id} className="mt-3 rounded-xl border border-neutral-200 p-4">
                        <Text className="font-medium">{plan.title}</Text>
                        <Text className="mt-1 text-neutral-500">
                            {plan.startDate} to {plan.endDate}
                        </Text>
                    </View>
                ))
            ) : (
                <Text className="mt-2 text-neutral-500">
                    No plans yet. Reaching kwits-api worked -- it returned an empty list.
                </Text>
            )}

            <Pressable onPress={resetOnboarding} className="mt-10">
                <Text>Reset onboarding (dev only)</Text>
            </Pressable>
        </ScrollView>
    );
}
