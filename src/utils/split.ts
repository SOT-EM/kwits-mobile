import type { ExpenseSplit, UserId } from "../types";

export function calculateEqualSplit(
  amount: number,
  participantIds: UserId[],
): ExpenseSplit[] {
  if (participantIds.length === 0) return [];
  const baseShare = Math.floor((amount / participantIds.length) * 100) / 100;
  const distributed = baseShare * participantIds.length;
  const remainder = Math.round((amount - distributed) * 100) / 100;
  return participantIds.map((userId, index) => ({
    userId,
    shareAmount: index === 0 ? baseShare + remainder : baseShare,
  }));
}

export function validateCustomSplit(
  totalAmount: number,
  splits: ExpenseSplit[],
) {
  const assigned = splits.reduce((sum, s) => sum + s.shareAmount, 0);
  const difference = Math.round((totalAmount - assigned) * 100) / 100;
  return { isValid: difference === 0, difference };
}
