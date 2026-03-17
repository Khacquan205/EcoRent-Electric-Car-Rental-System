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

// === User-to-User Chat types (matching backend DTOs) ===

export interface ConversationDto {
  id: number;
  otherUserId: number;
  otherUserName: string;
  postId?: number | null;
  postTitle?: string | null;
  postImage?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  createdAt: string;
}

export interface MessageDto {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface PagedMessages {
  items: MessageDto[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface CreateConversationRequest {
  otherUserId: number;
  postId?: number | null;
}
