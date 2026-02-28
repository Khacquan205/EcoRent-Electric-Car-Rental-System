import { apiFetch } from "./client";

export interface SubscriptionListItem {
  id: number;
  packageId: number;
  packageName: string;
  startDate: string;
  endDate: string;
  totalPosts: number;
  remainingPosts: number;
  status: number;
  statusName: string;
  createdAt: string;
}

export interface CreateSubscriptionRequest {
  packageId: number;
  source?: string;
}

export interface CreateSubscriptionResponse {
  id: number;
  packageId: number;
  startDate: string;
  endDate: string;
  totalPosts: number;
  remainingPosts: number;
  status: number;
}

export interface SubscriptionDetail {
  id: number;
  packageId: number;
  packageName: string;
  startDate: string;
  endDate: string;
  totalPosts: number;
  remainingPosts: number;
  status: number;
  statusName: string;
  createdAt: string;
  updatedAt?: string;
  source?: string;
  price?: number;
}

export async function createSubscription(
  body: CreateSubscriptionRequest
): Promise<CreateSubscriptionResponse> {
  return apiFetch<CreateSubscriptionResponse>("/api/Subscription/create-subscription", {
    method: "POST",
    body,
  });
}

export async function getMySubscriptions(): Promise<SubscriptionListItem[]> {
  return apiFetch<SubscriptionListItem[]>("/api/Subscription/my-subscriptions", {
    method: "GET",
  });
}

export async function getSubscriptionDetail(
  subscriptionId: number
): Promise<SubscriptionDetail> {
  return apiFetch<SubscriptionDetail>(`/api/Subscription/${subscriptionId}`, {
    method: "GET",
  });
}
