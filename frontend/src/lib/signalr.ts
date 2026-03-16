/**
 * SignalR hub URL. Trên ecorent.site phải gọi api.ecorent.site trực tiếp (Nginx route).
 */
export function getNotificationsHubUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (configured && configured.trim().length > 0) {
    return `${configured.replace(/\/$/, "")}/hubs/notifications`;
  }
  if (typeof window !== "undefined") {
    const host = window.location?.hostname ?? "";
    if (host === "ecorent.site" || host === "www.ecorent.site") {
      return "https://api.ecorent.site/hubs/notifications";
    }
    return "/hubs/notifications";
  }
  return "http://localhost:8080/hubs/notifications";
}

export interface NotificationPayload {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  postId: number | null;
  createdAt: string;
}
