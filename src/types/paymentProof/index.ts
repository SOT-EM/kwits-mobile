export type PaymentProofStatus = "pending" | "confirmed" | "needs_resubmission";

export interface PaymentProof {
  id: string;
  owerBalanceId: string;
  receiptImageUrl: string;
  declaredAmount: number; // this specific proof's amount (supports partial payments)
  status: PaymentProofStatus;
  rejectionReason?: string;
  createdAt: string;
  confirmedAt?: string;
}
