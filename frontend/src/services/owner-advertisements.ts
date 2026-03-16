import { apiFetch } from "./client";

export type AdPackage = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  durationDays: number;
  maxPosts: number;
  priorityLevel: number;
  status: number;
  createdAt?: string;
  updatedAt?: string | null;
};

export type OwnerAdCredit = {
  id: number;
  adPackageId: number;
  adPackageName: string;
  remainingPosts: number;
  durationDays: number;
  createdAt: string;
};

export async function getAdPackages(): Promise<AdPackage[]> {
  return apiFetch<AdPackage[]>("/api/owner/advertisements/packages", {
    method: "GET",
  });
}

export async function getMyAdCredits(): Promise<OwnerAdCredit[]> {
  return apiFetch<OwnerAdCredit[]>("/api/owner/advertisements/my-credits", {
    method: "GET",
  });
}

export async function createAdOrder(
  adPackageId: number,
): Promise<{ adOrderId: number }> {
  return apiFetch<{ adOrderId: number }>("/api/owner/advertisements/create-ads", {
    method: "POST",
    body: { adPackageId },
  });
}

export async function createAdOrderPaymentUrl(
  adOrderId: number,
): Promise<{ paymentUrl: string }> {
  return apiFetch<{ paymentUrl: string }>(
    `/api/payment/create/ad-order/${adOrderId}`,
    { method: "POST" },
  );
}

export async function applyAdToPost(
  postId: number,
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(
    "/api/owner/advertisements/apply-post-ad",
    { method: "POST", body: { postId } },
  );
}

