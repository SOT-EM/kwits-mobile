import type { UserId } from "../user";
import type { PlanId } from "../travelPlan";

export type ExpenseId = string;
export type SplitType = "equal" | "custom";
export type EntryMethod = "ocr" | "manual";

export interface ExpenseSplit {
  userId: UserId;
  shareAmount: number; // PHP
}

export interface Expense {
  id: ExpenseId;
  planId: PlanId;
  payerId: UserId;
  amount: number; // PHP, total from receipt
  label: string;
  category?: string;
  receiptImageUrl: string;
  entryMethod: EntryMethod;
  splitType: SplitType;
  splits: ExpenseSplit[]; // for 'equal', each shareAmount = amount / N; for 'custom', must sum to `amount`
  paymentQrId?: string; // optional, references UserPaymentQR
  createdAt: string;
}
