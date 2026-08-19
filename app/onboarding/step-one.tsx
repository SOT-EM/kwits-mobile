// app/onboarding/step-one.tsx
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { StepDots } from "@/components/steppers/StepDots";

export default function StepOne() {
    const router = useRouter();

    return (
        <View className="flex-1 p-6">
            <StepDots active={0} total={3} />
            <Text className="mt-10 text-2xl font-semibold">
                Welcome to the app
            </Text>
            <Pressable
                onPress={() => router.push("/onboarding/step-two")}
                className="mt-auto rounded-xl bg-neutral-900 p-4"
            >
                <Text className="text-center text-white">Next</Text>
            </Pressable>
        </View>
    );
}