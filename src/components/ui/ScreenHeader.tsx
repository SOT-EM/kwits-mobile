import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { ChevronLeftIcon } from "@/components/ui/icons";

interface ScreenHeaderProps {
  title?: string;
  /** Replaces the title, e.g. the onboarding step dots. */
  center?: ReactNode;
  /** Omit to hide the back button; navigation stays the caller's decision. */
  onBack?: () => void;
}

export function ScreenHeader({ title, center, onBack }: ScreenHeaderProps) {
  return (
    <View className="min-h-[60px] flex-row items-center justify-center">
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          onPress={onBack}
          className="absolute left-0 h-12 w-12 items-center justify-center rounded-full bg-input active:opacity-70"
        >
          <ChevronLeftIcon />
        </Pressable>
      ) : null}

      {center ?? (
        <Text
          accessibilityRole="header"
          numberOfLines={2}
          className="mx-14 text-center text-lg font-sans-semibold text-foreground"
        >
          {title}
        </Text>
      )}
    </View>
  );
}
