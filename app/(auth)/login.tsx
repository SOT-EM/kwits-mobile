import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";

import { FormScreen } from "@/components/layout/FormScreen";
import { Button, PasswordField, TextField } from "@/components/ui";
import { useGoBack } from "@/hooks/useGoBack";
import { useAuthStore } from "@/lib/auth";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";

export default function LoginScreen() {
    const goBack = useGoBack("/(auth)/welcome");
    const login = useAuthStore((state) => state.login);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);
    const clearError = useAuthStore((state) => state.clearError);

    const { control, handleSubmit, formState } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    // A stale failure from a previous attempt should not greet the next visit.
    useEffect(() => clearError, [clearError]);

    const onSubmit = handleSubmit(async (values) => {
        // Routing on success belongs to the root layout: it reads the new token
        // and sends the user on to onboarding or the tabs.
        await login(values.email, values.password);
    });

    return (
        <FormScreen
            title="Login with Email"
            onBack={goBack}
            footer={
                <>
                    {error ? (
                        <Text className="font-sans px-1 text-center text-sm text-danger">{error}</Text>
                    ) : null}
                    <Button label="Login" onPress={onSubmit} isLoading={isLoading} />
                </>
            }
        >
            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                        label="Email"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={formState.errors.email?.message}
                        editable={!isLoading}
                        placeholder="you@example.com"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        keyboardType="email-address"
                        returnKeyType="next"
                    />
                )}
            />

            <View className="gap-2">
                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <PasswordField
                            label="Password"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={formState.errors.password?.message}
                            editable={!isLoading}
                            autoComplete="current-password"
                            returnKeyType="go"
                            onSubmitEditing={onSubmit}
                        />
                    )}
                />

                <Text accessibilityRole="link" className="font-sans pt-4 px-1 text-md text-muted">
                    Forgot Password?
                </Text>
            </View>
        </FormScreen>
    );
}
