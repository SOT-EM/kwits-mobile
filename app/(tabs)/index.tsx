import { View, Text, ScrollView } from "react-native";

export default function DashboardScreen() {
    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: "600" }}>Dashboard</Text>
        </ScrollView>
    );
}