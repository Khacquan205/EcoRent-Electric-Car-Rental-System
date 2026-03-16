import { apiFetch } from "./client";

export type AdminStatsResponse = {
  totalPackagesSold: number;
  totalPosts: number;
  activeOwnersCount: number;
  monthlyRevenue: number;
};

export type AdminMonthlyItemDto = {
  month: string;
  packagesSold: number;
  postsCount: number;
};

export type AdminPackageDistributionItemDto = {
  packageName: string;
  count: number;
};

export type AdminPostStatusItemDto = {
  statusName: string;
  count: number;
};

export async function getAdminStats() {
  return apiFetch<AdminStatsResponse>("/api/admin/dashboard/stats");
}

export async function getAdminMonthly(months: number = 6) {
  return apiFetch<AdminMonthlyItemDto[]>(
    `/api/admin/dashboard/monthly?months=${months}`,
  );
}

export async function getAdminPackageDistribution() {
  return apiFetch<AdminPackageDistributionItemDto[]>(
    "/api/admin/dashboard/package-distribution",
  );
}

export async function getAdminPostStatus() {
  return apiFetch<AdminPostStatusItemDto[]>("/api/admin/dashboard/post-status");
}
