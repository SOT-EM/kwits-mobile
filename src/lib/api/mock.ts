import AsyncStorage from "@react-native-async-storage/async-storage";

import { RESEND_COOLDOWN_SECONDS } from "@/constants/auth";
import type { KwitsApi, LoginResponse, SignupInput } from "@/types";

import { ApiError } from "./error";

/**
 * In-memory stand-in for kwits-api's auth endpoints, used while the real
 * verify-otp / resend-code routes do not exist yet. Accounts are mirrored to
 * AsyncStorage so a signup interrupted by process death can still be verified
 * after a restart.
 *
 * Seeded account: demo@kwits.com / Kwits1234. Every emailed code is 123456.
 */

const STORAGE_KEY = "mockAccounts";
const LATENCY_MS = 600;
const FIXED_OTP = "123456";

const SEED_ACCOUNT: MockAccount = {
  username: "demo",
  fullName: "Demo Kwitser",
  email: "demo@kwits.com",
  password: "Kwits1234",
  isVerified: true,
};

interface MockAccount extends SignupInput {
  isVerified: boolean;
}

let accounts: Record<string, MockAccount> | null = null;

const normalise = (email: string) => email.trim().toLowerCase();

const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

async function load(): Promise<Record<string, MockAccount>> {
  if (accounts) return accounts;
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  let stored: Record<string, MockAccount> = {};
  if (raw) {
    try {
      stored = JSON.parse(raw) as Record<string, MockAccount>;
    } catch {
      stored = {};
    }
  }
  accounts = { [SEED_ACCOUNT.email]: SEED_ACCOUNT, ...stored };
  return accounts;
}

async function save(next: Record<string, MockAccount>) {
  accounts = next;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function sessionFor(account: MockAccount): LoginResponse {
  return {
    accessToken: `mock-access-${normalise(account.email)}`,
    refreshToken: `mock-refresh-${normalise(account.email)}`,
    expiresIn: 3600,
    user: {
      id: `mock-${normalise(account.email)}`,
      email: account.email,
      username: account.username,
      fullName: account.fullName,
    },
  };
}

export const mockApi: KwitsApi = {
  login: async (email, password) => {
    await wait();
    const account = (await load())[normalise(email)];
    if (!account || account.password !== password) {
      throw new ApiError(401, "Incorrect email or password.");
    }
    return sessionFor(account);
  },

  signup: async (input) => {
    await wait();
    const key = normalise(input.email);
    const current = await load();
    if (current[key]) {
      throw new ApiError(409, "That email is already registered.", {
        email: "That email is already registered.",
      });
    }
    await save({ ...current, [key]: { ...input, email: key, isVerified: false } });
    return { email: key, resendAfterSeconds: RESEND_COOLDOWN_SECONDS };
  },

  verifyOtp: async (email, code) => {
    await wait();
    const key = normalise(email);
    const current = await load();
    const account = current[key];
    if (!account) {
      throw new ApiError(404, "We could not find that signup. Register again.");
    }
    if (code !== FIXED_OTP) {
      throw new ApiError(400, "That code is not right. Check it and try again.");
    }
    const verified = { ...account, isVerified: true };
    await save({ ...current, [key]: verified });
    return sessionFor(verified);
  },

  resendCode: async (email) => {
    await wait();
    const account = (await load())[normalise(email)];
    if (!account) {
      throw new ApiError(404, "We could not find that signup. Register again.");
    }
    return { resendAfterSeconds: RESEND_COOLDOWN_SECONDS };
  },

  getPlans: async () => {
    await wait();
    return [];
  },
};
