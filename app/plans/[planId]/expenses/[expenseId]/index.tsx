import { View, Text } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";

export default function ExpenseDetailScreen() {
    const { planId, expenseId } = useLocalSearchParams<{ planId: string; expenseId: string }>();
    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>Expense: {expenseId}</Text>
            <Link href={`/plans/${planId}/expenses/${expenseId}/pay`}>I paid my share</Link>
        </View>
    );
}