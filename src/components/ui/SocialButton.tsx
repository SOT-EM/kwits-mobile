import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

interface SocialButtonProps {
  label: string;
  icon: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}

/** Outlined pill with a leading brand mark, used for the sign-in providers. */
export function SocialButton({ label, icon, onPress, disabled = false }: SocialButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      // Contents start at a fixed inset instead of being centred as a group: the
      // three labels differ in width, so centring each row on its own lands every
      // icon at a different x. A percentage inset keeps the block optically
      // centred across screen widths while the icons share one edge.
      className={`min-h-[60px] flex-row items-center rounded-full border border-hairline pl-[15%] pr-6 py-4 active:opacity-70 ${disabled ? "opacity-40" : ""}`}
    >
      <View className="mr-3">{icon}</View>
      <Text className="text-lg font-sans-semibold text-foreground">{label}</Text>
    </Pressable>
  );
}
