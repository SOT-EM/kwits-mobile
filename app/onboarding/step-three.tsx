import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/lib/onboarding";
import { StepDots } from "@/components/steppers/StepDots";

export default function StepThree() {
    const router = useRouter();
    const complete = useOnboardingStore((state) => state.complete);

    const finish = async () => {
        await complete();
        router.replace("/(auth)/login");
    };

    return (
        <View className="flex-1 p-6">
            <StepDots active={2} total={3} />
            <Text className="mt-10 text-2xl font-semibold">
                You're all set
            </Text>
            <Pressable
                onPress={finish}
                className="mt-auto rounded-xl bg-neutral-900 p-4"
            >
                <Text className="text-center text-white">Get started</Text>
            </Pressable>
        </View>
    );
}