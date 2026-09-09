import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import Animated from "react-native-reanimated";

import { OTP_LENGTH } from "@/constants/auth";
import { useShake } from "@/hooks/useShake";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  hasError?: boolean;
  editable?: boolean;
  autoFocus?: boolean;
}

/**
 * Renders `length` boxes over a single transparent TextInput rather than one
 * input per digit. That keeps SMS autofill, paste, and backspace working the
 * way the OS expects, with no cross-input focus juggling to get wrong.
 */
export function OtpInput({
  value,
  onChange,
  length = OTP_LENGTH,
  hasError = false,
  editable = true,
  autoFocus = false,
}: OtpInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { style: shakeStyle, trigger } = useShake();

  useEffect(() => {
    if (hasError) trigger();
  }, [hasError, trigger]);

  const activeIndex = Math.min(value.length, length - 1);

  const borderFor = (index: number) => {
    if (hasError) return "border-danger";
    if (isFocused && index === activeIndex) return "border-primary";
    return "border-transparent";
  };

  return (
    <Animated.View style={shakeStyle} className="relative flex-row gap-2">
      {Array.from({ length }).map((_, index) => (
        <View
          key={index}
          className={`min-h-[60px] flex-1 items-center justify-center rounded-2xl border bg-input ${borderFor(index)}`}
        >
          <Text className="text-xl font-sans-semibold text-foreground">{value[index] ?? ""}</Text>
        </View>
      ))}

      <TextInput
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, length))}
        editable={editable}
        autoFocus={autoFocus}
        keyboardType="number-pad"
        maxLength={length}
        caretHidden
        autoComplete="sms-otp"
        textContentType="oneTimeCode"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        accessibilityLabel={`${length} digit verification code`}
        className="font-sans absolute bottom-0 left-0 right-0 top-0 opacity-0"
      />
    </Animated.View>
  );
}
