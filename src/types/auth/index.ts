import type { AuthUser, PendingVerification, SignupInput } from "../session";

export interface AuthState {
  /** False until restore() has run, so screens can avoid flashing the login form. */
  isReady: boolean;
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  /** Set between signup and a successful OTP confirmation. Survives a restart. */
  pendingVerification: PendingVerification | null;
  restore: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (input: SignupInput) => Promise<boolean>;
  /** Confirms the code emailed to `pendingVerification`, signing the user in. */
  verifyOtp: (code: string) => Promise<boolean>;
  resendCode: () => Promise<boolean>;
  clearError: () => void;
  logout: () => Promise<void>;
}
