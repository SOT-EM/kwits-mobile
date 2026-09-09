export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
}

/** What kwits-api's /v1/auth/login and /v1/auth/verify-otp return. */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser | null;
}

export interface SignupInput {
  username: string;
  fullName: string;
  email: string;
  password: string;
}

/**
 * Signup deliberately does not return a session: the account stays unverified
 * until the emailed code is confirmed, so the caller gets a resend budget
 * instead of a token.
 */
export interface SignupResponse {
  email: string;
  resendAfterSeconds: number;
}

export interface ResendCodeResponse {
  resendAfterSeconds: number;
}

/** Persisted so a signup interrupted by process death resumes on Verify. */
export interface PendingVerification {
  email: string;
}
