import { useEffect, useRef } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import Animated, {
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

import { DURATION, EASE } from "@/constants/motion";

const DOT = { width: 8, height: 4, gap: 16, pillWidth: 24 } as const;

interface StepDotsProps {
    active: number;
    total: number;
}

/**
 * Progress pill for a stepped flow: small tracks for every step and one pill
 * that slides onto the current one.
 *
 * Mount this ONCE, in the flow's layout rather than inside a step. Each step is
 * its own route, so an instance living in the step would unmount on every
 * navigation, and the pill would appear already in place instead of travelling
 * there.
 *
 * Positions are measured rather than derived from DOT, so changing the dot size
 * or the gap needs no matching change here. The slide is interpolated in *index*
 * space rather than in pixels, so a re-measure mid-slide (rotation, font
 * scaling) is picked up on the next frame instead of animating towards a stale
 * value, and the first pass is set outright so nothing slides in from the edge.
 */
export function StepDots({ active, total }: StepDotsProps) {
    const reduceMotion = useReducedMotion();
    const centres = useSharedValue<number[]>([]);
    const position = useSharedValue(active);
    const measured = useRef<(number | undefined)[]>([]);
    const hasMounted = useRef(false);

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            position.value = active;
            return;
        }
        position.value = withTiming(active, {
            duration: reduceMotion ? 0 : DURATION.base,
            easing: EASE.standard,
        });
    }, [active, position, reduceMotion]);

    const handleDotLayout = (index: number, event: LayoutChangeEvent) => {
        const { x, width } = event.nativeEvent.layout;
        measured.current[index] = x + width / 2;
        centres.value = Array.from({ length: total }, (_, i) => measured.current[i] ?? 0);
    };

    const pillStyle = useAnimatedStyle(() => {
        const points = centres.value;

        // Nothing measured yet: stay hidden rather than sitting at the far left.
        if (points.length === 0) return { opacity: 0, transform: [{ translateX: 0 }] };

        const clamped = Math.min(Math.max(position.value, 0), points.length - 1);
        const from = Math.floor(clamped);
        const to = Math.ceil(clamped);
        const centre = points[from] + (points[to] - points[from]) * (clamped - from);

        return { opacity: 1, transform: [{ translateX: centre - DOT.pillWidth / 2 }] };
    });

    return (
        <View
            accessibilityRole="progressbar"
            accessibilityLabel="Onboarding progress"
            accessibilityValue={{ min: 1, max: total, now: active + 1 }}
            className="flex-row items-center"
            style={{ gap: DOT.gap }}
        >
            {Array.from({ length: total }).map((_, index) => (
                <View
                    key={index}
                    onLayout={(event) => handleDotLayout(index, event)}
                    style={{ width: DOT.width, height: DOT.height }}
                    className="rounded-full bg-dot-inactive"
                />
            ))}

            {/* Painted after the tracks so it covers the one it lands on. */}
            <Animated.View
                style={[
                    {
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: DOT.pillWidth,
                        height: DOT.height,
                        borderRadius: DOT.height / 2,
                    },
                    pillStyle,
                ]}
                className="bg-foreground"
            />
        </View>
    );
}
