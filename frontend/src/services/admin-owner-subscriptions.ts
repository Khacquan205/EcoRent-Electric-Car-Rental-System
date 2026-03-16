import { apiFetch } from "./client";

export type OwnerSubscription = {
  id: number;
  ownerId: number;
  ownerEmail?: string;
  packageName?: string;
  packageId?: number;
  startDate?: string;
  endDate?: string;
  price?: number;
  status: number;
  createdAt?: string;
};

export async function getAdminOwnerSubscriptions(): Promise<
  OwnerSubscription[]
> {
  return apiFetch<OwnerSubscription[]>(
    "/api/admin/package/get-all-subscriptions",
    {
      method: "GET",
    },
  );
}
