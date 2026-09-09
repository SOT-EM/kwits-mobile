import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text } from "react-native";

import { FormScreen } from "@/components/layout/FormScreen";
import { Button, PasswordField, TextField } from "@/components/ui";
import { useGoBack } from "@/hooks/useGoBack";
import { useAuthStore } from "@/lib/auth";
import { registerSchema, type RegisterValues } from "@/lib/validation/auth";

export default function RegisterScreen() {
    const router = useRouter();
    const goBack = useGoBack("/(auth)/welcome");
    const signup = useAuthStore((state) => state.signup);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);
    const clearError = useAuthStore((state) => state.clearError);

    const { control, handleSubmit, formState } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: "",
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    useEffect(() => clearError, [clearError]);

    const onSubmit = handleSubmit(async (values) => {
        const succeeded = await signup({
            username: values.username,
            fullName: values.fullName,
            email: values.email,
            password: values.password,
        });
        if (succeeded) router.push("/(auth)/verify-email");
    });

    return (
        <FormScreen
            title="Register"
            onBack={goBack}
            footer={
                <>
                    {error ? (
                        <Text className="font-sans px-1 text-center text-sm text-danger">{error}</Text>
                    ) : null}
                    <Button label="Next" onPress={onSubmit} isLoading={isLoading} />
                </>
            }
        >
            <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                        label="Username"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={formState.errors.username?.message}
                        editable={!isLoading}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="username"
                        returnKeyType="next"
                    />
                )}
            />

            <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                        label="Full Name"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={formState.errors.fullName?.message}
                        editable={!isLoading}
                        autoCapitalize="words"
                        autoComplete="name"
                        returnKeyType="next"
                    />
                )}
            />

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
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        keyboardType="email-address"
                        returnKeyType="next"
                    />
                )}
            />

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
                        autoComplete="new-password"
                        returnKeyType="next"
                    />
                )}
            />

            <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                    <PasswordField
                        label="Confirm Password"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={formState.errors.confirmPassword?.message}
                        editable={!isLoading}
                        autoComplete="new-password"
                        returnKeyType="go"
                        onSubmitEditing={onSubmit}
                    />
                )}
            />
        </FormScreen>
    );
}
