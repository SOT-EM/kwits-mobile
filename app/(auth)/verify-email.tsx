import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { FormScreen } from "@/components/layout/FormScreen";
import { Button, OtpInput } from "@/components/ui";
import { OTP_LENGTH, RESEND_COOLDOWN_SECONDS } from "@/constants/auth";
import { useCountdown } from "@/hooks/useCountdown";
import { useGoBack } from "@/hooks/useGoBack";
import { useAuthStore } from "@/lib/auth";
import { formatCountdown } from "@/utils/time";

export default function VerifyEmailScreen() {
    const goBack = useGoBack("/(auth)/welcome");
    const pendingVerification = useAuthStore((state) => state.pendingVerification);
    const token = useAuthStore((state) => state.token);
    const verifyOtp = useAuthStore((state) => state.verifyOtp);
    const resendCode = useAuthStore((state) => state.resendCode);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);
    const clearError = useAuthStore((state) => state.clearError);

    const [code, setCode] = useState("");
    const { remaining, isActive, start } = useCountdown();

    useEffect(() => {
        start(RESEND_COOLDOWN_SECONDS);
    }, [start]);

    const onChangeCode = (next: string) => {
        if (error) clearError();
        setCode(next);
    };

    const onResend = async () => {
        const succeeded = await resendCode();
        if (succeeded) {
            setCode("");
            start(RESEND_COOLDOWN_SECONDS);
        }
    };

    // A successful verify clears the pending signup, so absence alone does not
    // mean the user took a wrong turn -- if a token arrived, hold still and let
    // the root gate move on to onboarding. Only a genuinely signed-out visitor
    // with nothing in flight gets sent back to Register.
    if (!pendingVerification) {
        return token ? null : <Redirect href="/(auth)/register" />;
    }

    return (
        <FormScreen
            title="Verify your Email Address"
            onBack={goBack}
            footer={
                <Button
                    label="Verify"
                    onPress={() => verifyOtp(code)}
                    isLoading={isLoading}
                    disabled={code.length < OTP_LENGTH}
                />
            }
        >
            <View className="gap-4">
                <Text className="font-sans text-center text-base text-muted">
                    We just emailed a {OTP_LENGTH}-digit code to{" "}
                    <Text className="font-sans-semibold text-foreground">
                        {pendingVerification.email}
                    </Text>
                    .
                </Text>
                <Text className="font-sans text-center text-base text-muted">
                    Enter it below to confirm your account and get started.
                </Text>
            </View>

            <View className="gap-4">
                <OtpInput
                    value={code}
                    onChange={onChangeCode}
                    hasError={Boolean(error)}
                    editable={!isLoading}
                    autoFocus
                />

                {error ? (
                    <Text className="font-sans text-center text-sm text-danger">{error}</Text>
                ) : null}
            </View>

            <Text className="font-sans text-center text-sm text-muted">
                Don&apos;t see it? Check your spam folder or{" "}
                <Text
                    accessibilityRole="link"
                    accessibilityState={{ disabled: isActive }}
                    onPress={isActive ? undefined : onResend}
                    className="font-sans-semibold text-accent"
                >
                    Resend code
                </Text>
                {isActive ? ` in ${formatCountdown(remaining)}` : ""}
            </Text>
        </FormScreen>
    );
}
