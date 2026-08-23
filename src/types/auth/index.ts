import type { AuthUser } from "../session";

export interface AuthState {
  /** False until restore() has run, so screens can avoid flashing the login form. */
  isReady: boolean;
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  restore: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}
