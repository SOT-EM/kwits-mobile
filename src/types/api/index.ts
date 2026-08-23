/** The error shape kwits-api's GlobalExceptionHandler returns. */
export interface ApiErrorBody {
  status?: number;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export interface RequestOptions {
  /** Bearer token to attach. Omit for the auth endpoints, which are public. */
  token?: string | null;
  body?: unknown;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
}

/**
 * The raw wire shape of GET /v1/plans, before it is mapped to the domain
 * `TravelPlan` type. `estimatedCost` is nullable here because that is how it comes
 * back from kwits-api's Plan entity; the domain type uses `undefined` instead.
 */
export interface PlanResponseBody {
  id: string;
  hostId: string;
  title: string;
  startDate: string;
  endDate: string;
  estimatedCost: number | null;
  createdAt: string;
}
