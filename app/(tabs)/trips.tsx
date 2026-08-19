import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function TripsScreen() {
    return (
        <View className="flex-1 p-4">
            <Text className="mb-3 text-xl font-semibold">My Trips</Text>
            <Link href="/plans/create">Create a new trip</Link>
        </View>
    );
}