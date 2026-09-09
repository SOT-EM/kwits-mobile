import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type { AuthState, AuthUser, LoginResponse, PendingVerification } from "@/types";

import { useOnboardingStore } from "../onboarding";

import { ApiError, api } from "../api";

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";
const PENDING_KEY = "authPendingVerification";

const FALLBACK_ERROR = "Something went wrong. Try again.";

const messageFor = (err: unknown) =>
  err instanceof ApiError ? err.message : FALLBACK_ERROR;

function parseStored<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Corrupt entry: treat as absent rather than crashing on startup.
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => {
  /** Persists a session and clears any half-finished signup. */
  const acceptSession = async (session: LoginResponse) => {
    const user = session.user;
    await AsyncStorage.setItem(TOKEN_KEY, session.accessToken);
    await AsyncStorage.removeItem(PENDING_KEY);
    if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    set({
      token: session.accessToken,
      user,
      pendingVerification: null,
      isLoading: false,
      error: null,
    });
  };

  return {
    isReady: false,
    token: null,
    user: null,
    isLoading: false,
    error: null,
    pendingVerification: null,

    restore: async () => {
      const [token, rawUser, rawPending] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
        AsyncStorage.getItem(PENDING_KEY),
      ]);
      set({
        token,
        user: parseStored<AuthUser>(rawUser),
        pendingVerification: parseStored<PendingVerification>(rawPending),
        isReady: true,
      });
    },

    /** Returns whether the call succeeded, so the screen can decide to navigate. */
    login: async (email, password) => {
      set({ isLoading: true, error: null });
      try {
        await acceptSession(await api.login(email.trim(), password));
        return true;
      } catch (err) {
        set({ isLoading: false, error: messageFor(err) });
        return false;
      }
    },

    signup: async (input) => {
      set({ isLoading: true, error: null });
      try {
        const { email } = await api.signup({ ...input, email: input.email.trim() });
        const pending: PendingVerification = { email };
        await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));
        set({ pendingVerification: pending, isLoading: false, error: null });
        return true;
      } catch (err) {
        set({ isLoading: false, error: messageFor(err) });
        return false;
      }
    },

    verifyOtp: async (code) => {
      const pending = get().pendingVerification;
      if (!pending) {
        set({ error: "That signup expired. Register again." });
        return false;
      }
      set({ isLoading: true, error: null });
      try {
        await acceptSession(await api.verifyOtp(pending.email, code));
        return true;
      } catch (err) {
        set({ isLoading: false, error: messageFor(err) });
        return false;
      }
    },

    resendCode: async () => {
      const pending = get().pendingVerification;
      if (!pending) return false;
      set({ error: null });
      try {
        await api.resendCode(pending.email);
        return true;
      } catch (err) {
        set({ error: messageFor(err) });
        return false;
      }
    },

    clearError: () => set({ error: null }),

    logout: async () => {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, PENDING_KEY]);
      // Onboarding is account-scoped in the designs, so the next sign-up sees it again.
      await useOnboardingStore.getState().reset();
      set({ token: null, user: null, pendingVerification: null, error: null });
    },
  };
});
