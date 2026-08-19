import { View, Text } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";

export default function PlanDetailScreen() {
    const { planId } = useLocalSearchParams<{ planId: string }>();
    return (
        <View className="flex-1 p-4">
            <Text className="text-lg font-semibold">Trip: {planId}</Text>
            <Link href={`/plans/${planId}/expenses/create`}>Log an expense</Link>
            <Link href={`/plans/${planId}/invite`}>Invite peers</Link>
        </View>
    );
}