import { useRouter } from "expo-router";
import { Alert, Text, View } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

import { SocialButton } from "@/components/ui";
import { AppleIcon, GoogleIcon, MailIcon } from "@/components/ui/icons";
import { DURATION, EASE } from "@/constants/motion";
import { useReplayOnFocus } from "@/hooks/useReplayOnFocus";

const SSO_NOTICE = "Single sign-on is not wired up yet. Use Continue with Email for now.";

export default function WelcomeScreen() {
    const router = useRouter();
    const replayKey = useReplayOnFocus();

    const showSsoNotice = (provider: string) =>
        Alert.alert(`${provider} sign-in is coming soon`, SSO_NOTICE);

    return (
        <View className="flex-1 bg-background px-8 pb-4">
            <Animated.View
                key={`hero-${replayKey}`}
                entering={FadeIn.duration(DURATION.slow).easing(EASE.decelerate)}
                className="flex-1 items-center justify-start gap-8 pt-12"
            >
                <View className="aspect-square w-2/3 rounded-3xl bg-skeleton" />
                <View className="items-center gap-6">
                    <Text className="text-center text-3xl font-sans-bold text-foreground">
                        Welcome to Kwits
                    </Text>
                    <Text className="font-sans text-center text-xl text-muted">Gala, Bayad, Kwits na!</Text>
                </View>
            </Animated.View>

            <Animated.View
                key={`providers-${replayKey}`}
                entering={FadeInUp.duration(DURATION.slow).easing(EASE.decelerate).delay(DURATION.fast)}
                className="flex-1 justify-center gap-4"
            >
                <SocialButton
                    label="Continue with Google"
                    icon={<GoogleIcon />}
                    onPress={() => showSsoNotice("Google")}
                />
                <SocialButton
                    label="Continue with Apple"
                    icon={<AppleIcon />}
                    onPress={() => showSsoNotice("Apple")}
                />
                <SocialButton
                    label="Continue with Email"
                    icon={<MailIcon />}
                    onPress={() => router.push("/(auth)/login")}
                />
            </Animated.View>

            <Animated.View
                key={`legal-${replayKey}`}
                entering={FadeInUp.duration(DURATION.base).easing(EASE.decelerate).delay(DURATION.base)}
                className="items-center "
            >
                <Text className="font-sans text-center text-md text-muted pb-10 ">
                    Don&apos;t have an account?{" "}
                    <Text
                        accessibilityRole="link"
                        onPress={() => router.push("/(auth)/register")}
                        className="font-sans-semibold text-accent"
                    >
                        Register here
                    </Text>
                </Text>

                <Text className="font-sans text-center text-sm text-muted">
                    By continuing, you agree to Kwit&apos;s{"\n"}
                    <Text className="font-sans-semibold text-accent">Terms &amp; Conditions</Text> and{" "}
                    <Text className="font-sans-semibold text-accent">Privacy Policy</Text>.
                </Text>
            </Animated.View>
        </View>
    );
}
