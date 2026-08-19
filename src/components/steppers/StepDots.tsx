// components/StepDots.tsx
import { View } from "react-native";

export function StepDots({ active, total }: { active: number; total: number }) {
    return (
        <View style={{ flexDirection: "row", gap: 6 }}>
            {Array.from({ length: total }).map((_, i) => (
                <View
                    key={i}
                    style={{
                        width: 24,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: i === active ? "#111" : "#ddd",
                    }}
                />
            ))}
        </View>
    );
}