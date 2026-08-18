import { View, Text } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";

export default function PlanDetailScreen() {
    const { planId } = useLocalSearchParams<{ planId: string }>();
    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>Trip: {planId}</Text>
            <Link href={`/plans/${planId}/expenses/create`}>Log an expense</Link>
            <Link href={`/plans/${planId}/invite`}>Invite peers</Link>
        </View>
    );
}