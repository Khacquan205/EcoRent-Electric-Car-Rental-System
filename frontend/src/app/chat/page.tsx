"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { Conversation, ChatMessage } from "@/types/chat";
import { chatService } from "@/services/chat";
<<<<<<< Updated upstream
import { ApiError } from "@/services/client";

type StoredChatState = {
  conversations: Conversation[];
  activeConversationId: number | null;
  messagesByConversation: Record<number, ChatMessage[]>;
};

const CHAT_STORAGE_KEY = "ecorent.ai-chat.history.v1";

function createWelcomeMessage(conversationId: number): ChatMessage {
  return {
    id: -Date.now(),
    conversationId,
    senderRole: "assistant",
    content:
      "Xin chào! Bạn muốn tìm xe thuê theo tiêu chí gì? (Ví dụ: xe giá khoảng 400k/ngày, xe hãng Mercedes, xe theo danh mục hoặc khu vực...)",
    createdAt: new Date().toISOString(),
  };
}

function createDefaultChatState(): StoredChatState {
  const defaultConvId = 1;
  return {
    conversations: [
      {
        id: defaultConvId,
        title: "Trợ lý ảo EcoRent",
        createdAt: new Date().toISOString(),
      },
    ],
    activeConversationId: defaultConvId,
    messagesByConversation: {
      [defaultConvId]: [createWelcomeMessage(defaultConvId)],
    },
  };
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    number | null
  >(null);
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<number, ChatMessage[]>
  >({});

  const [isSidebarLoading, setIsSidebarLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load chat history from local storage on first render.
  useEffect(() => {
    setIsSidebarLoading(true);
    try {
      const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
      if (!raw) {
        const initial = createDefaultChatState();
        setConversations(initial.conversations);
        setActiveConversationId(initial.activeConversationId);
        setMessagesByConversation(initial.messagesByConversation);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<StoredChatState>;
      const parsedConversations = parsed.conversations ?? [];
      const parsedMessages = parsed.messagesByConversation ?? {};

      if (parsedConversations.length === 0) {
        const initial = createDefaultChatState();
        setConversations(initial.conversations);
        setActiveConversationId(initial.activeConversationId);
        setMessagesByConversation(initial.messagesByConversation);
        return;
      }

      setConversations(parsedConversations);
      setMessagesByConversation(parsedMessages);

      const fallbackId = parsedConversations[0]?.id ?? null;
      const restoredId =
        parsed.activeConversationId != null &&
        parsedConversations.some(
          (conv) => conv.id === parsed.activeConversationId,
        )
          ? parsed.activeConversationId
          : fallbackId;
      setActiveConversationId(restoredId);
    } catch {
      const initial = createDefaultChatState();
      setConversations(initial.conversations);
      setActiveConversationId(initial.activeConversationId);
      setMessagesByConversation(initial.messagesByConversation);
    } finally {
      setIsSidebarLoading(false);
    }
  }, []);

  useEffect(() => {
    if (conversations.length === 0) return;

    const data: StoredChatState = {
      conversations,
      activeConversationId,
      messagesByConversation,
    };

    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(data));
  }, [conversations, activeConversationId, messagesByConversation]);

  const activeMessages = activeConversationId
    ? (messagesByConversation[activeConversationId] ?? [])
    : [];

  const handleCreateNewChat = useCallback(async () => {
    const newConversationId = Date.now();
    const now = new Date().toISOString();

    setConversations((prev) => [
      {
        id: newConversationId,
        title: "Cuộc trò chuyện mới",
        createdAt: now,
      },
      ...prev,
    ]);

    setMessagesByConversation((prev) => ({
      ...prev,
      [newConversationId]: [createWelcomeMessage(newConversationId)],
    }));

    setActiveConversationId(newConversationId);
  }, []);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!activeConversationId) return;

      try {
        setIsSending(true);

        const userMessageId = Date.now();
        setMessagesByConversation((prev) => ({
          ...prev,
          [activeConversationId]: [
            ...(prev[activeConversationId] ?? []),
            {
              id: userMessageId,
              conversationId: activeConversationId,
              senderRole: "user",
              content: text,
              createdAt: new Date().toISOString(),
            },
          ],
        }));

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== activeConversationId) return conv;
            const currentTitle = conv.title?.trim() ?? "";
            if (currentTitle && currentTitle !== "Cuộc trò chuyện mới")
              return conv;
            return {
              ...conv,
              title: text.slice(0, 40),
            };
          }),
        );

        // Call the SuggestCars API
        const response = await chatService.suggestCars({ message: text });

        const aiMessageId = Date.now() + 1;
        const topSuggestedPosts = (response.suggestedPosts ?? []).slice(0, 5);
        setMessagesByConversation((prev) => ({
          ...prev,
          [activeConversationId]: [
            ...(prev[activeConversationId] ?? []),
            {
              id: aiMessageId,
              conversationId: activeConversationId,
              senderRole: "assistant",
              content: response.reply,
              suggestedPosts: topSuggestedPosts,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      } catch (err) {
        const errorMessage =
          err instanceof ApiError && err.status === 401
            ? "Bạn cần đăng nhập để tiếp tục chat với AI."
            : "Hệ thống AI đang gặp sự cố kết nối. Vui lòng thử lại sau.";

        // Avoid noisy dev overlay for expected API failures.
        if (process.env.NODE_ENV !== "production") {
          console.warn("[Chat] send message failed", err);
        }

        setMessagesByConversation((prev) => ({
          ...prev,
          [activeConversationId]: [
            ...(prev[activeConversationId] ?? []),
            {
              id: Date.now(),
              conversationId: activeConversationId,
              senderRole: "assistant",
              content: errorMessage,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      } finally {
        setIsSending(false);
      }
    },
    [activeConversationId],
  );

  const handleSuggestCars = useCallback(
    async (text?: string) => {
      if (!activeConversationId) return;
      const requestText = text?.trim();
      await handleSendMessage(
        requestText && requestText.length > 0
          ? requestText
          : "Gợi ý xe cho tôi",
      );
    },
    [activeConversationId, handleSendMessage],
  );

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
=======

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [isSidebarLoading, setIsSidebarLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Initialize a mock local session
  useEffect(() => {
    const defaultConvId = 1;
    setConversations([
      {
        id: defaultConvId,
        title: "Trợ lý ảo EcoRent",
        createdAt: new Date().toISOString()
      }
    ]);
    setActiveConversationId(defaultConvId);
    setMessages([
      {
        id: -1,
        conversationId: defaultConvId,
        senderRole: "assistant",
        content: "Xin chào! Bạn muốn tìm xe thuê theo tiêu chí gì? (Ví dụ: xe giá khoảng 400k/ngày, xe hãng Mercedes, xe theo danh mục hoặc khu vực...)",
        createdAt: new Date().toISOString()
      }
    ]);
  }, []);

  const handleCreateNewChat = useCallback(async () => {
    // Just clear messages
    setMessages([
      {
        id: -1,
        conversationId: activeConversationId || 1,
        senderRole: "assistant",
        content: "Xin chào! Bạn muốn tìm xe thuê theo tiêu chí gì? (Ví dụ: xe giá khoảng 400k/ngày, xe hãng Mercedes, xe theo danh mục hoặc khu vực...)",
        createdAt: new Date().toISOString()
      }
    ]);
  }, [activeConversationId]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!activeConversationId) return;

    try {
      setIsSending(true);
      
      const userMessageId = Date.now();
      setMessages((prev) => [
         ...prev,
         {
            id: userMessageId,
            conversationId: activeConversationId,
            senderRole: "user",
            content: text,
            createdAt: new Date().toISOString()
         }
      ]);

      const requestPayload = { message: text };
      const response = await chatService.suggestCars(requestPayload);
      
      const aiMessageId = Date.now() + 1;
      setMessages((prev) => [
         ...prev,
         {
            id: aiMessageId,
            conversationId: activeConversationId,
            senderRole: "assistant",
            content: response.reply,
            suggestedPosts: response.suggestedPosts,
            createdAt: new Date().toISOString()
         }
      ]);

    } catch (err) {
      console.error("Failed to send message", err);
      // Optional: Add an error message payload to chat
      setMessages((prev) => [
        ...prev,
        {
           id: Date.now(),
           conversationId: activeConversationId,
           senderRole: "assistant",
           content: "Hệ thống AI đang quá tải hoặc cấu hình chưa đúng. Vui lòng thử lại sau.",
           createdAt: new Date().toISOString()
        }
     ]);
    } finally {
      setIsSending(false);
    }
  }, [activeConversationId]);

  const handleSuggestCars = useCallback(async () => {
    if (!activeConversationId) return;
    
    // Simulate user pressing suggest cars
    handleSendMessage("Gợi ý xe cho tôi");
  }, [activeConversationId, handleSendMessage]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
      {/* 64px offset assumes a standard top navigation bar height */}
>>>>>>> Stashed changes
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewChat={handleCreateNewChat}
        isLoading={isSidebarLoading}
      />
      <div className="flex flex-col flex-1 h-full min-w-0">
<<<<<<< Updated upstream
        <ChatMessageList messages={activeMessages} isLoading={isSending} />
        <ChatInput
          onSendMessage={handleSendMessage}
          onSuggestCars={handleSuggestCars}
          isLoading={isSending}
          disabled={false}
=======
        <ChatMessageList 
           messages={messages} 
           isLoading={isSending} 
        />
        <ChatInput 
           onSendMessage={handleSendMessage}
           onSuggestCars={handleSuggestCars}
           isLoading={isSending}
           disabled={false}
>>>>>>> Stashed changes
        />
      </div>
    </div>
  );
}
