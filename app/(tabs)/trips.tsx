import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function TripsScreen() {
    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 12 }}>My Trips</Text>
            <Link href="/plans/create">Create a new trip</Link>
        </View>
    );
}