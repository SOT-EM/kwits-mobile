import { forwardRef, useCallback, useState } from "react";
import { Pressable, type TextInput, type TextInputProps } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import { DURATION, EASE } from "@/constants/motion";

import { TextField } from "./TextField";

const POP_SCALE = 1.1;

interface PasswordFieldProps extends Omit<TextInputProps, "secureTextEntry"> {
  label: string;
  error?: string;
}

export const PasswordField = forwardRef<TextInput, PasswordFieldProps>(function PasswordField(
  { label, error, ...rest },
  ref,
) {
  const [isVisible, setIsVisible] = useState(false);
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  const toggle = useCallback(() => {
    if (!reduceMotion) {
      scale.value = withSequence(withSpring(POP_SCALE, EASE.spring), withSpring(1, EASE.spring));
    }
    setIsVisible((current) => !current);
  }, [reduceMotion, scale]);

  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <TextField
      ref={ref}
      label={label}
      error={error}
      secureTextEntry={!isVisible}
      autoCapitalize="none"
      autoCorrect={false}
      trailing={
        <Animated.View style={popStyle} className="pl-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isVisible ? "Hide password" : "Show password"}
            hitSlop={12}
            onPress={toggle}
          >
            {/* Keyed so the swapped glyph fades in instead of hard-cutting. Only
                the incoming icon animates, so the field never shifts width. */}
            <Animated.View
              key={isVisible ? "visible" : "hidden"}
              entering={FadeIn.duration(DURATION.fast)}
            >
              {isVisible ? <EyeIcon /> : <EyeOffIcon />}
            </Animated.View>
          </Pressable>
        </Animated.View>
      }
      {...rest}
    />
  );
});
