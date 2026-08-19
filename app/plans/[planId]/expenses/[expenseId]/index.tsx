import { View, Text } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";

export default function ExpenseDetailScreen() {
    const { planId, expenseId } = useLocalSearchParams<{ planId: string; expenseId: string }>();
    return (
        <View className="flex-1 p-4">
            <Text className="text-lg font-semibold">Expense: {expenseId}</Text>
            <Link href={`/plans/${planId}/expenses/${expenseId}/pay`}>I paid my share</Link>
        </View>
    );
}