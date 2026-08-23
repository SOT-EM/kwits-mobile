import type { UserId } from "../user";
import type { ExpenseId } from "../expense";

export type OwerBalanceStatus = "unpaid" | "partial" | "paid";

export interface OwerBalance {
  id: string;
  expenseId: ExpenseId;
  owerId: UserId;
  shareAmount: number; // snapshot from Expense.splits at creation
  amountPaid: number; // running total of confirmed PaymentProofs
  status: OwerBalanceStatus;
  lastReminderSentAt?: string;
}
