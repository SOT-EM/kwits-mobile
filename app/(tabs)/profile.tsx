import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function ProfileScreen() {
    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 12 }}>Profile</Text>
            <Link href="/profile/qr-codes">Manage Payment QR Codes</Link>
        </View>
    );
}