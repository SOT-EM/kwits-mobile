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
    bundleIdentifier: "com.suden.kwits",
  },
  android: {
    package: "com.suden.kwits",
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
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    mapTilerApiKey: process.env.MAPTILER_API_KEY,
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
        },
      },
    ],
  ],
});
