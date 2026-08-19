import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function LoginScreen() {
    const router = useRouter();

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>Login Screen</Text>
            <Pressable
                onPress={() => router.push("/(tabs)")}
                style={{ marginTop: "auto", backgroundColor: "#111", padding: 16, borderRadius: 12 }}
            >
                <Text style={{ color: "#fff", textAlign: "center" }}>Next</Text>
            </Pressable>
        </View>
    );
}