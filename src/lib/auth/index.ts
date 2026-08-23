import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type { AuthState, AuthUser } from "@/types";

import { ApiError, api } from "../api";

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

export const useAuthStore = create<AuthState>((set) => ({
  isReady: false,
  token: null,
  user: null,
  isLoading: false,
  error: null,

  restore: async () => {
    const [token, rawUser] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(USER_KEY),
    ]);
    let user: AuthUser | null = null;
    if (rawUser) {
      try {
        user = JSON.parse(rawUser) as AuthUser;
      } catch {
        // Corrupt entry: treat as signed out rather than crashing on startup.
        user = null;
      }
    }
    set({ token, user, isReady: true });
  },

  /** Returns whether the login succeeded, so the screen can decide to navigate. */
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const session = await api.login(email, password);
      const user = session.user;
      await AsyncStorage.setItem(TOKEN_KEY, session.accessToken);
      if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ token: session.accessToken, user, isLoading: false, error: null });
      return true;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong. Try again.";
      set({ isLoading: false, error: message });
      return false;
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    set({ token: null, user: null, error: null });
  },
}));
