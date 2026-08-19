// components/StepDots.tsx
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

function Dot({ isActive }: { isActive: boolean }) {
    const animatedStyle = useAnimatedStyle(() => ({
        width: withTiming(isActive ? 24 : 8, { duration: 200 }),
        backgroundColor: withTiming(isActive ? "#111111" : "#dddddd", { duration: 200 }),
    }));

    return <Animated.View className="h-1 rounded-full" style={animatedStyle} />;
}

export function StepDots({ active, total }: { active: number; total: number }) {
    return (
        <Animated.View className="flex-row gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
                <Dot key={i} isActive={i === active} />
            ))}
        </Animated.View>
    );
}
