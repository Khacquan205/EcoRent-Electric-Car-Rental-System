export type AdPackageCreateRequest = {
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  maxPosts: number;
  priorityLevel: number;
};

export type AdPackageUpdateRequest = {
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  maxPosts: number;
  priorityLevel: number;
  status: number;
};

export type AdPackageResponse = {
  id: number;
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  maxPosts: number;
  priorityLevel: number;
  status: number;
  createdAt: string;
  updatedAt?: string;
};

export type AdPackage = AdPackageResponse;
