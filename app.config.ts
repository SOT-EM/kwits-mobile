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
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
  plugins: [
    "expo-router",
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
