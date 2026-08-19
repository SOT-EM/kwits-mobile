// app/onboarding/step-one.tsx
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { StepDots } from "@/components/steppers/StepDots";

export default function StepOne() {
    const router = useRouter();

    return (
        <View style={{ flex: 1, padding: 24 }}>
            <StepDots active={0} total={3} />
            <Text style={{ fontSize: 24, fontWeight: "600", marginTop: 40 }}>
                Welcome to the app
            </Text>
            <Pressable
                onPress={() => router.push("/onboarding/step-two")}
                style={{ marginTop: "auto", backgroundColor: "#111", padding: 16, borderRadius: 12 }}
            >
                <Text style={{ color: "#fff", textAlign: "center" }}>Next</Text>
            </Pressable>
        </View>
    );
}