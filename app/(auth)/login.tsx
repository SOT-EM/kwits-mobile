import { View, Text, Pressable, TextInput, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuthStore } from "@/lib/auth";

export default function LoginScreen() {
    const router = useRouter();
    const { login, isLoading, error } = useAuthStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const canSubmit = email.trim().length > 0 && password.length > 0 && !isLoading;

    const onSubmit = async () => {
        const succeeded = await login(email.trim(), password);
        if (succeeded) {
            router.replace("/(tabs)");
        }
        // On failure the store holds the message; it renders below the form.
    };

    return (
        <View className="flex-1 p-6">
            <Text className="mt-10 text-2xl font-semibold">Sign in</Text>

            <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                editable={!isLoading}
                className="mt-8 rounded-xl border border-neutral-300 p-4"
            />

            <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                autoCapitalize="none"
                autoComplete="current-password"
                secureTextEntry
                editable={!isLoading}
                onSubmitEditing={() => {
                    if (canSubmit) onSubmit();
                }}
                className="mt-4 rounded-xl border border-neutral-300 p-4"
            />

            {error ? (
                <Text className="mt-4 text-red-600">{error}</Text>
            ) : null}

            <Pressable
                onPress={onSubmit}
                disabled={!canSubmit}
                className={`mt-auto rounded-xl p-4 ${
                    canSubmit ? "bg-neutral-900" : "bg-neutral-400"
                }`}
            >
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-center text-white">Sign in</Text>
                )}
            </Pressable>
        </View>
    );
}
