import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

import { Stagger } from "@/components/motion/Stagger";
import { ScreenHeader } from "@/components/ui";
import { useReplayOnFocus } from "@/hooks/useReplayOnFocus";
import { DURATION, EASE } from "@/constants/motion";

interface FormScreenProps {
  title: string;
  onBack?: () => void;
  children: ReactNode;
  /** Pinned to the bottom, outside the scroll area. */
  footer: ReactNode;
}

/**
 * Shell shared by the auth form screens: header, scrollable body, pinned
 * action. Android resizes the window for the keyboard on its own, so only iOS
 * needs KeyboardAvoidingView to do any work.
 *
 * The entrance animation lives here rather than in each screen, so every form
 * screen animates identically. It layers on top of the stack transition in
 * (auth)/_layout.tsx, which handles the route-to-route slide.
 */
const KEYBOARD_BEHAVIOR = Platform.select({ ios: "padding" as const, default: undefined });

const FOOTER_DELAY = 120;

export function FormScreen({ title, onBack, children, footer }: FormScreenProps) {
  const replayKey = useReplayOnFocus();

  return (
    <KeyboardAvoidingView behavior={KEYBOARD_BEHAVIOR} className="flex-1 bg-background">
      <Animated.View
        key={`header-${replayKey}`}
        entering={FadeIn.duration(DURATION.base).easing(EASE.decelerate)}
        className="px-6 pt-2"
      >
        <ScreenHeader title={title} onBack={onBack} />
      </Animated.View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-6 pb-8 pt-8"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Stagger replayKey={replayKey}>{children}</Stagger>
      </ScrollView>

      <Animated.View
        key={`footer-${replayKey}`}
        entering={FadeInUp.duration(DURATION.base).easing(EASE.decelerate).delay(FOOTER_DELAY)}
        className="gap-4 px-6 pb-4"
      >
        {footer}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
