"use client";

import React, { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { MessagesSidebar } from "@/components/messages/MessagesSidebar";
import { MessagesChat } from "@/components/messages/MessagesChat";
import { MessagesInput } from "@/components/messages/MessagesInput";
import { ConversationDto, MessageDto } from "@/types/chat";
import { messagingService } from "@/services/chat";
import { useSignalRChat } from "@/hooks/useSignalRChat";
import { getSessionCookie } from "@/lib/authSession";
import { decodeJwt } from "@/lib/jwtDecode";
import { Loader2 } from "lucide-react";

function getCurrentUserId(): number {
  if (typeof window === "undefined") return 0;
  try {
    const token =
      window.localStorage.getItem("accessToken") ??
      getSessionCookie()?.accessToken;
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.sub) return Number(payload.sub);
      if (payload?.userId) return Number(payload.userId);
    }
    const session = getSessionCookie();
    if (session?.user && typeof session.user === "object") {
      const u = session.user as Record<string, unknown>;
      if (typeof u.id === "number") return u.id;
      if (typeof u.userId === "number") return u.userId;
    }
  } catch {
    /* ignore */
  }
  return 0;
}

function MessagesPageInner() {
  const searchParams = useSearchParams();
  const targetConvId = searchParams.get("conversationId");

  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    number | null
  >(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isConvLoading, setIsConvLoading] = useState(true);
  const [isMsgLoading, setIsMsgLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const currentUserId = useRef(0);

  useEffect(() => {
    currentUserId.current = getCurrentUserId();
  }, []);

  // ── SignalR ──
  const { joinConversation, leaveConversation, sendMessage, markAsRead } =
    useSignalRChat({
      onReceiveMessage: (msg) => {
        setMessages((prev) => {
          if (
            prev.length > 0 &&
            prev[0].conversationId === msg.conversationId
          ) {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          }
          return prev;
        });

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== msg.conversationId) return c;
            return {
              ...c,
              lastMessage: msg.content,
              lastMessageAt: msg.createdAt,
              unreadCount:
                msg.senderId !== currentUserId.current
                  ? c.unreadCount + 1
                  : c.unreadCount,
            };
          }),
        );
      },
      onMessagesRead: (data) => {
        if (data.readByUserId !== currentUserId.current) {
          setMessages((prev) =>
            prev.map((m) =>
              m.conversationId === data.conversationId &&
              m.senderId === currentUserId.current
                ? { ...m, isRead: true }
                : m,
            ),
          );
        }
      },
    });

  // ── Load conversations ──
  useEffect(() => {
    async function loadConversations() {
      try {
        setIsConvLoading(true);
        const data = await messagingService.getConversations();
        setConversations(data);

        if (targetConvId) {
          const convId = Number(targetConvId);
          if (data.some((c) => c.id === convId)) {
            setActiveConversationId(convId);
          } else if (data.length > 0) {
            setActiveConversationId(data[0].id);
          }
        } else if (data.length > 0) {
          setActiveConversationId(data[0].id);
        }
      } catch (err) {
        console.error("[Messages] Load conversations failed:", err);
      } finally {
        setIsConvLoading(false);
      }
    }
    loadConversations();
  }, [targetConvId]);

  // ── Load messages when active conversation changes ──
  const prevConvRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activeConversationId) return;

    if (prevConvRef.current && prevConvRef.current !== activeConversationId) {
      leaveConversation(prevConvRef.current);
    }
    prevConvRef.current = activeConversationId;

    async function loadMessages() {
      try {
        setIsMsgLoading(true);
        setMessages([]);
        setCurrentPage(1);

        const result = await messagingService.getMessages(
          activeConversationId!,
          1,
          20,
        );
        setMessages(result.items.reverse());
        setTotalPages(result.totalPages);
        setCurrentPage(result.currentPage);

        joinConversation(activeConversationId!);

        markAsRead(activeConversationId!);
        messagingService.markAsRead(activeConversationId!).catch(() => {});

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId ? { ...c, unreadCount: 0 } : c,
          ),
        );
      } catch (err) {
        console.error("[Messages] Load messages failed:", err);
      } finally {
        setIsMsgLoading(false);
      }
    }
    loadMessages();
  }, [activeConversationId, joinConversation, leaveConversation, markAsRead]);

  // ── Load more (older messages) ──
  const handleLoadMore = useCallback(async () => {
    if (!activeConversationId || isMsgLoading || currentPage >= totalPages)
      return;

    const nextPage = currentPage + 1;
    try {
      setIsMsgLoading(true);
      const result = await messagingService.getMessages(
        activeConversationId,
        nextPage,
        20,
      );
      setMessages((prev) => [...result.items.reverse(), ...prev]);
      setCurrentPage(nextPage);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error("[Messages] Load more failed:", err);
    } finally {
      setIsMsgLoading(false);
    }
  }, [activeConversationId, currentPage, totalPages, isMsgLoading]);

  // ── Send message ──
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!activeConversationId) return;

      setIsSending(true);
      try {
        try {
          await sendMessage(activeConversationId, text);
        } catch {
          const msg = await messagingService.sendMessage(
            activeConversationId,
            text,
          );
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId
              ? {
                  ...c,
                  lastMessage: text,
                  lastMessageAt: new Date().toISOString(),
                }
              : c,
          ),
        );
      } catch (err) {
        console.error("[Messages] Send failed:", err);
      } finally {
        setIsSending(false);
      }
    },
    [activeConversationId, sendMessage],
  );

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? null;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
      <MessagesSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        isLoading={isConvLoading}
      />
      <div className="flex flex-col flex-1 h-full min-w-0">
        <MessagesChat
          conversation={activeConversation}
          messages={messages}
          currentUserId={currentUserId.current}
          isLoading={isMsgLoading}
          hasMore={currentPage < totalPages}
          onLoadMore={handleLoadMore}
        />
        {activeConversation && (
          <MessagesInput
            onSendMessage={handleSendMessage}
            isLoading={isSending}
            disabled={!activeConversation}
          />
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <MessagesPageInner />
    </Suspense>
  );
}
