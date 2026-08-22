import Constants from "expo-constants";

/**
 * Client for kwits-api. This is the app's only network boundary -- Supabase is
 * reached through kwits-api, never directly from here.
 */
const apiBaseUrl = (Constants.expoConfig?.extra?.apiBaseUrl as string) ?? "";

/** Error carrying the HTTP status, so callers can tell 401 from a real failure. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** The error shape kwits-api's GlobalExceptionHandler returns. */
interface ApiErrorBody {
  status?: number;
  message?: string;
  fieldErrors?: Record<string, string>;
}

interface RequestOptions {
  /** Bearer token to attach. Omit for the auth endpoints, which are public. */
  token?: string | null;
  body?: unknown;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
}

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

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { id: string; email: string } | null;
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", { body: { email, password } }),

  signup: (email: string, password: string, name?: string) =>
    request<LoginResponse>("/auth/signup", { body: { email, password, name } }),

  /** Protected: requires the token returned by login. */
  getPlans: (token: string | null) =>
    request<TravelPlanResponse[]>("/plans", { token }),
};

/**
 * What GET /plans returns. Field names match kwits-api's Plan entity; `estimatedCost`
 * is nullable there, so it is null rather than absent.
 */
export interface TravelPlanResponse {
  id: string;
  hostId: string;
  title: string;
  startDate: string;
  endDate: string;
  estimatedCost: number | null;
  createdAt: string;
}
