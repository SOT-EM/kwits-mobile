export interface AuthUser {
  id: string;
  email: string;
}

/** What kwits-api's /v1/auth/login and /v1/auth/signup return. */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser | null;
}
