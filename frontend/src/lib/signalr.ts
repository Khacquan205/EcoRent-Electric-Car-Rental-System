/**
 * SignalR hub URL. In the browser we use same-origin so Next.js rewrites /hubs/* to the backend (no CORS).
 * When NEXT_PUBLIC_API_BASE_URL is set we use that for direct backend URL (e.g. production).
 */
export function getNotificationsHubUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (configured && configured.trim().length > 0) {
    return `${configured.replace(/\/$/, "")}/hubs/notifications`;
  }
  if (typeof window !== "undefined") {
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
