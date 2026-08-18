import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const supabaseUrl = (Constants.expoConfig?.extra?.supabaseUrl as string) ?? "";
const supabaseAnonKey =
  (Constants.expoConfig?.extra?.supabaseAnonKey as string) ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
