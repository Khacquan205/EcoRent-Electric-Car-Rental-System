import { PostListItemDto } from "@/types/api";

export interface Conversation {
  id: number;
  userId?: number;
  title: string | null;
  createdAt: string;
  unreadCount?: number;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId?: number;
  senderName?: string;
  senderRole?: "user" | "assistant"; 
  content: string;
  isRead?: boolean;
  createdAt: string;
  suggestedPosts?: PostListItemDto[];
}

export interface SendMessageRequest {
  content: string;
}

export interface SuggestCarsRequest {
  message: string;
}

export interface SuggestCarsResponseDto {
  reply: string;
  suggestedPosts: PostListItemDto[];
}
