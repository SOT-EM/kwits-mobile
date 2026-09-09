import { forwardRef, useCallback, useEffect, type ReactNode } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";
import Animated, {
  FadeInDown,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { COLORS } from "@/constants/colors";
import { DURATION, EASE } from "@/constants/motion";
import { CONTROL_HEIGHT } from "@/constants/sizing";
import { useShake } from "@/hooks/useShake";

// Derived from the props rather than spelled out: React Native has changed the
// concrete focus/blur event types between versions, and these follow along.
type FocusHandler = NonNullable<TextInputProps["onFocus"]>;
type BlurHandler = NonNullable<TextInputProps["onBlur"]>;

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  /** Rendered inside the field on the right, e.g. the password visibility toggle. */
  trailing?: ReactNode;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, trailing, editable = true, onFocus, onBlur, ...rest },
  ref,
) {
  const { style: shakeStyle, trigger } = useShake();
  const hasError = Boolean(error);

  // Focus lives in a shared value, not state: the border tween then runs on the
  // UI thread without re-rendering the field on every focus change.
  const focus = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : DURATION.fast;

  useEffect(() => {
    if (hasError) trigger();
  }, [hasError, trigger]);

  const handleFocus = useCallback<FocusHandler>(
    (event) => {
      focus.value = withTiming(1, { duration, easing: EASE.standard });
      onFocus?.(event);
    },
    [duration, focus, onFocus],
  );

  const handleBlur = useCallback<BlurHandler>(
    (event) => {
      focus.value = withTiming(0, { duration, easing: EASE.standard });
      onBlur?.(event);
    },
    [duration, focus, onBlur],
  );

  // Error outranks focus, so a field that just failed validation stays red while
  // it is being corrected. Idle matches the fill rather than being transparent,
  // which keeps the tween off pure black on the way to the active colour.
  const borderStyle = useAnimatedStyle(() => ({
    borderColor: hasError
      ? COLORS.danger
      : interpolateColor(focus.value, [0, 1], [COLORS.input, COLORS.primary]),
  }));

  return (
    <View className="gap-2">
      <Text className="text-lg font-sans-semibold text-foreground">{label}</Text>

      <Animated.View
        style={[{ minHeight: CONTROL_HEIGHT }, shakeStyle, borderStyle]}
        className={`flex-row items-center rounded-full border bg-input px-8 ${editable ? "" : "opacity-60"
          }`}
      >
        <TextInput
          ref={ref}
          editable={editable}
          placeholderTextColor={COLORS.muted}
          accessibilityLabel={label}
          className="font-sans flex-1 p-0 text-lg leading-5 text-foreground"
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {trailing}
      </Animated.View>

      {error ? (
        <Animated.View entering={FadeInDown.duration(DURATION.fast).easing(EASE.decelerate)}>
          <Text className="font-sans px-1 text-sm text-danger">{error}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
});
