import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function ProfileScreen() {
    return (
        <View className="flex-1 p-4">
            <Text className="mb-3 text-xl font-semibold">Profile</Text>
            <Link href="/profile/qr-codes">Manage Payment QR Codes</Link>
        </View>
    );
}