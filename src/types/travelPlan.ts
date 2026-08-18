import type { UserId } from "./user";

export type PlanId = string;

export interface TravelPlan {
  id: PlanId;
  hostId: UserId;
  title: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  estimatedCost?: number; // PHP, optional
  createdAt: string;
}
