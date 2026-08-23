import type { UserId } from "../user";

export interface UserPaymentQR {
  id: string;
  userId: UserId;
  label: string; // e.g. "GCash", "BPI" — user-defined, max 3 per user
  qrImageUrl: string;
  createdAt: string;
}
