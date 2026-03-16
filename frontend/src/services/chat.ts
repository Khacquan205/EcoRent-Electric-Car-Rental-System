import { apiFetch } from "./client";
import {
  Conversation,
  ChatMessage,
  SendMessageRequest,
  SuggestCarsRequest,
  SuggestCarsResponseDto,
} from "@/types/chat";

export const chatService = {
  getConversations: () => {
    return apiFetch<Conversation[]>("/api/Chat/conversations", {
      method: "GET",
    });
  },

  createConversation: (otherUserId: number | string = 1) => {
    return apiFetch<Conversation>("/api/Chat/conversations", {
      method: "POST",
      body: { otherUserId }
    });
  },

  getMessages: (conversationId: string) => {
    return apiFetch<ChatMessage[]>(
      `/api/Chat/conversations/${conversationId}/messages`,
      {
        method: "GET",
      }
    );
  },

  sendMessage: (conversationId: string, payload: SendMessageRequest) => {
    return apiFetch<ChatMessage>(
      `/api/Chat/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: payload,
      }
    );
  },

  markAsRead: (conversationId: string) => {
    return apiFetch<void>(`/api/Chat/conversations/${conversationId}/read`, {
      method: "PUT",
    });
  },

  suggestCars: (payload: SuggestCarsRequest) => {
    return apiFetch<SuggestCarsResponseDto>("/api/Chat/suggest-cars", {
      method: "POST",
      body: payload,
    });
  },
};
