import { Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Button } from "@/components/ui";
import { DURATION, EASE } from "@/constants/motion";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
import { useReplayOnFocus } from "@/hooks/useReplayOnFocus";

interface OnboardingSlideProps {
  index: number;
}

/**
 * One onboarding step. The four step routes differ only by `index`.
 *
 * The header (back button and progress pill) is deliberately not here: it
 * belongs to app/onboarding/_layout.tsx so it survives step navigation.
 */
export function OnboardingSlide({ index }: OnboardingSlideProps) {
  const { slide, isLast, isFinishing, goNext, skip } = useOnboardingFlow(index);
  const replayKey = useReplayOnFocus();

  return (
    <View className="flex-1 bg-background px-6 pb-4">
      <Animated.View
        key={`body-${replayKey}`}
        entering={FadeInUp.duration(DURATION.slow).easing(EASE.decelerate)}
        className="flex-1 justify-center gap-8"
      >
        <View className="aspect-square w-[72%] self-center rounded-3xl bg-skeleton" />
        <View className="gap-4">
          <Text className="text-center text-2xl font-sans-bold text-foreground">{slide.title}</Text>
          <Text className="font-sans text-center text-base leading-6 text-muted">{slide.body}</Text>
        </View>
      </Animated.View>

      <Animated.View
        key={`actions-${replayKey}`}
        entering={FadeInUp.duration(DURATION.base).easing(EASE.decelerate).delay(DURATION.fast)}
        className="flex-row gap-4"
      >
        {isLast ? (
          <View className="flex-1">
            <Button label="Let's go!" onPress={goNext} isLoading={isFinishing} />
          </View>
        ) : (
          <>
            <View className="flex-1">
              <Button
                label="Skip"
                variant="secondary"
                onPress={skip}
                isLoading={isFinishing}
              />
            </View>
            <View className="flex-1">
              <Button label="Next" onPress={goNext} disabled={isFinishing} />
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}
