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
        <View style={{ flex: 1, padding: 24 }}>
            <StepDots active={2} total={3} />
            <Text style={{ fontSize: 24, fontWeight: "600", marginTop: 40 }}>
                You're all set
            </Text>
            <Pressable
                onPress={finish}
                style={{ marginTop: "auto", backgroundColor: "#111", padding: 16, borderRadius: 12 }}
            >
                <Text style={{ color: "#fff", textAlign: "center" }}>Get started</Text>
            </Pressable>
        </View>
    );
}