import { apiFetch } from "./client";
import {
  Conversation,
  ChatMessage,
  SendMessageRequest,
  SuggestCarsRequest,
  SuggestCarsResponseDto,
  ConversationDto,
  MessageDto,
  PagedMessages,
  CreateConversationRequest,
} from "@/types/chat";

// === AI Chatbot (existing) ===

export const chatService = {
  suggestCars: (payload: SuggestCarsRequest) => {
    return apiFetch<SuggestCarsResponseDto>("/api/Chat/suggest-cars", {
      method: "POST",
      body: payload,
    });
  },
};

// === User-to-User Chat ===

export const messagingService = {
  getConversations: () => {
    return apiFetch<ConversationDto[]>("/api/Chat/conversations", {
      method: "GET",
    });
  },

  createConversation: (req: CreateConversationRequest) => {
    return apiFetch<ConversationDto>("/api/Chat/conversations", {
      method: "POST",
      body: req,
    });
  },

  getMessages: (conversationId: number, page = 1, pageSize = 20) => {
    return apiFetch<PagedMessages>(
      `/api/Chat/conversations/${conversationId}/messages?page=${page}&pageSize=${pageSize}`,
      { method: "GET" },
    );
  },

  sendMessage: (conversationId: number, content: string) => {
    return apiFetch<MessageDto>(
      `/api/Chat/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: { content } satisfies SendMessageRequest,
      },
    );
  },

  markAsRead: (conversationId: number) => {
    return apiFetch<void>(`/api/Chat/conversations/${conversationId}/read`, {
      method: "PUT",
    });
  },
};
