// app/onboarding/index.tsx
import { Redirect } from "expo-router";

export default function OnboardingIndex() {
    return <Redirect href="/onboarding/step-one" />;
}