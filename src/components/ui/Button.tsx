import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";

import { COLORS } from "@/constants/colors";
import { CONTROL_HEIGHT } from "@/constants/sizing";
import type { ButtonVariant } from "@/types";

interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const CONTAINER: Record<ButtonVariant, string> = {
  primary: "bg-primary",
  secondary: "bg-background border border-hairline",
};

const LABEL: Record<ButtonVariant, string> = {
  primary: "text-on-primary",
  secondary: "text-foreground",
};

const SPINNER: Record<ButtonVariant, string> = {
  primary: COLORS["on-primary"],
  secondary: COLORS.foreground,
};

export function Button({
  label,
  variant = "primary",
  isLoading = false,
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled === true || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      disabled={isDisabled}
      style={{ minHeight: CONTROL_HEIGHT - 8 }}
      className={`flex-row items-center justify-center rounded-full px-6 py-4 active:opacity-80 ${CONTAINER[variant]} ${isDisabled ? "opacity-40" : ""}`}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={SPINNER[variant]} />
      ) : (
        <Text className={`text-center text-base font-sans-semibold ${LABEL[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
