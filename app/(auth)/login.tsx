import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function LoginScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 items-center justify-center">
            <Text>Login Screen</Text>
            <Pressable
                onPress={() => router.push("/(tabs)")}
                className="mt-auto rounded-xl bg-neutral-900 p-4"
            >
                <Text className="text-center text-white">Next</Text>
            </Pressable>
        </View>
    );
}