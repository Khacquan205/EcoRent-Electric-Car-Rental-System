"use client";

import { useEffect, useRef, useCallback } from "react";
import { getSessionCookie } from "@/lib/authSession";
import { getNotificationsHubUrl } from "@/lib/signalr";
import type { NotificationPayload } from "@/lib/signalr";

export type OnNotificationCallback = (payload: NotificationPayload) => void;

export function useSignalRNotifications(onNotification: OnNotificationCallback) {
  const callbackRef = useRef(onNotification);
  callbackRef.current = onNotification;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token =
      window.localStorage.getItem("accessToken") ??
      getSessionCookie()?.accessToken ??
      null;
    if (!token) return;

    let connection: import("@microsoft/signalr").HubConnection | null = null;

    async function connect() {
      try {
        const signalR = await import("@microsoft/signalr");
        const hubUrl = getNotificationsHubUrl();
        connection = new signalR.HubConnectionBuilder()
          .withUrl(hubUrl, {
            accessTokenFactory: () => (token ?? ""),
          })
          .withAutomaticReconnect()
          .build();

        connection.on("ReceiveNotification", (payload: NotificationPayload) => {
          callbackRef.current(payload);
        });

        await connection.start();
      } catch (err) {
        console.warn("[SignalR] Connect failed:", err);
      }
    }

    connect();
    return () => {
      connection?.stop().catch(() => {});
    };
  }, []);
}
