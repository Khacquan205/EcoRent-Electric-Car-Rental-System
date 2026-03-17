"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getSessionCookie } from "@/lib/authSession";
import { getChatHubUrl } from "@/lib/signalr";
import type { MessageDto } from "@/types/chat";

type HubConnection = import("@microsoft/signalr").HubConnection;

export interface UseSignalRChatOptions {
  /** Called when a new message arrives via ReceiveMessage event. */
  onReceiveMessage?: (message: MessageDto) => void;
  /** Called when messages are marked as read by the other user. */
  onMessagesRead?: (data: { conversationId: number; readByUserId: number }) => void;
  /** Called on hub error. */
  onError?: (error: string) => void;
}

export function useSignalRChat(options: UseSignalRChatOptions = {}) {
  const connectionRef = useRef<HubConnection | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [isConnected, setIsConnected] = useState(false);
  const joinedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token =
      window.localStorage.getItem("accessToken") ??
      getSessionCookie()?.accessToken ??
      null;
    if (!token) return;

    let connection: HubConnection | null = null;

    async function connect() {
      try {
        const signalR = await import("@microsoft/signalr");
        const hubUrl = getChatHubUrl();
        connection = new signalR.HubConnectionBuilder()
          .withUrl(hubUrl, {
            accessTokenFactory: () => token ?? "",
          })
          .withAutomaticReconnect()
          .build();

        connection.on("ReceiveMessage", (msg: MessageDto) => {
          optionsRef.current.onReceiveMessage?.(msg);
        });

        connection.on(
          "MessagesRead",
          (data: { conversationId: number; readByUserId: number }) => {
            optionsRef.current.onMessagesRead?.(data);
          },
        );

        connection.on("Error", (err: string) => {
          console.error("[SignalR Chat] Error:", err);
          optionsRef.current.onError?.(err);
        });

        connection.onreconnected(() => setIsConnected(true));
        connection.onclose(() => setIsConnected(false));

        await connection.start();
        connectionRef.current = connection;
        setIsConnected(true);
      } catch (err) {
        console.warn("[SignalR Chat] Connect failed:", err);
      }
    }

    connect();
    return () => {
      connection?.stop().catch(() => {});
      connectionRef.current = null;
      setIsConnected(false);
      joinedRef.current.clear();
    };
  }, []);

  const joinConversation = useCallback(async (conversationId: number) => {
    const conn = connectionRef.current;
    if (!conn || joinedRef.current.has(conversationId)) return;
    try {
      await conn.invoke("JoinConversation", conversationId);
      joinedRef.current.add(conversationId);
    } catch (err) {
      console.warn("[SignalR Chat] Join failed:", err);
    }
  }, []);

  const leaveConversation = useCallback(async (conversationId: number) => {
    const conn = connectionRef.current;
    if (!conn || !joinedRef.current.has(conversationId)) return;
    try {
      await conn.invoke("LeaveConversation", conversationId);
      joinedRef.current.delete(conversationId);
    } catch (err) {
      console.warn("[SignalR Chat] Leave failed:", err);
    }
  }, []);

  const sendMessage = useCallback(
    async (conversationId: number, content: string) => {
      const conn = connectionRef.current;
      if (!conn) return;
      try {
        await conn.invoke("SendMessage", conversationId, content);
      } catch (err) {
        console.warn("[SignalR Chat] SendMessage failed:", err);
        throw err; // let caller handle fallback
      }
    },
    [],
  );

  const markAsRead = useCallback(async (conversationId: number) => {
    const conn = connectionRef.current;
    if (!conn) return;
    try {
      await conn.invoke("MarkAsRead", conversationId);
    } catch (err) {
      console.warn("[SignalR Chat] MarkAsRead failed:", err);
    }
  }, []);

  return {
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage,
    markAsRead,
  };
}
