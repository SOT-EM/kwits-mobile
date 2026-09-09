import Constants from "expo-constants";

import type {
  ApiErrorBody,
  KwitsApi,
  LoginResponse,
  PlanResponseBody,
  RequestOptions,
  ResendCodeResponse,
  SignupResponse,
  TravelPlan,
} from "@/types";

import { ApiError } from "./error";
import { mockApi } from "./mock";

/**
 * Client for kwits-api. This is the app's only network boundary -- Supabase is
 * reached through kwits-api, never directly from here.
 */
const apiBaseUrl = (Constants.expoConfig?.extra?.apiBaseUrl as string) ?? "";
const useMockApi = Constants.expoConfig?.extra?.useMockApi === true;

export { ApiError };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, body, method = body ? "POST" : "GET" } = options;

  if (!apiBaseUrl) {
    throw new ApiError(
      0,
      "API_BASE_URL is not set. Copy .env.example to .env and restart Expo.",
    );
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // fetch only rejects when the request never completed, so this is reachability,
    // not an application error. The usual cause in development is kwits-api not
    // running, or API_BASE_URL pointing somewhere the emulator cannot see.
    throw new ApiError(0, `Could not reach kwits-api at ${apiBaseUrl}`);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const payload: unknown = text ? safeParse(text) : null;

  if (!response.ok) {
    const errorBody = (payload ?? {}) as ApiErrorBody;
    throw new ApiError(
      response.status,
      errorBody.message ?? `Request failed (${response.status})`,
      errorBody.fieldErrors,
    );
  }

  return payload as T;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

const liveApi: KwitsApi = {
  login: (email, password) =>
    request<LoginResponse>("/v1/auth/login", { body: { email, password } }),

  signup: (input) => request<SignupResponse>("/v1/auth/signup", { body: input }),

  verifyOtp: (email, code) =>
    request<LoginResponse>("/v1/auth/verify-otp", { body: { email, code } }),

  resendCode: (email) =>
    request<ResendCodeResponse>("/v1/auth/resend-code", { body: { email } }),

  /** Protected: requires the token returned by login. */
  getPlans: async (token) => {
    const plans = await request<PlanResponseBody[]>("/v1/plans", { token });
    return plans.map((plan) => ({
      ...plan,
      estimatedCost: plan.estimatedCost ?? undefined,
    }));
  },
};

/**
 * Swapped by USE_MOCK_API in .env. verify-otp and resend-code do not exist in
 * kwits-api yet, so the mock is what the signup flow currently runs against.
 */
export const api: KwitsApi = useMockApi ? mockApi : liveApi;
