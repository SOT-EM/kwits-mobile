import "dotenv/config";
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "kwits",
  slug: "kwits",
  version: "1.0.0",
  orientation: "portrait",
  owner: "kopibaras-den",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  scheme: "kwits",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.kwits.sotm",
  },
  android: {
    package: "com.kwits.sotm",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    mapTilerApiKey: process.env.MAPTILER_API_KEY,
    apiBaseUrl: process.env.API_BASE_URL,
    useMockApi: process.env.USE_MOCK_API === "true",
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
  plugins: [
    "expo-router",
    [
      "expo-font",
      {
        // Embedded at build time rather than loaded at runtime, so text renders in
        // the right face on the first frame with no flash of a fallback font.
        // Only the three weights the designs use are embedded -- each file is
        // ~700KB, so shipping all nine would add ~6MB to the binary for nothing.
        fonts: [
          "./assets/fonts/SunghyunSans-Regular.ttf",
          "./assets/fonts/SunghyunSans-SemiBold.ttf",
          "./assets/fonts/SunghyunSans-Bold.ttf",
        ],
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          multiDexEnabled: true,
          // Android blocks plaintext HTTP by default on recent API levels, which
          // silently breaks calls to kwits-api at http://10.0.2.2:8080 during local
          // development. LOCAL DEVELOPMENT ONLY -- a deployed API must be HTTPS, and
          // a shipped build should not rely on this flag.
          usesCleartextTraffic: true,
        },
      },
    ],
  ],
});
