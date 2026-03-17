import React from "react";
import { ConversationDto } from "@/types/chat";
import { MessageSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";

interface MessagesSidebarProps {
  conversations: ConversationDto[];
  activeConversationId: number | null;
  onSelectConversation: (id: number) => void;
  isLoading?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(-2)
    .toUpperCase();
}

export function MessagesSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  isLoading,
}: MessagesSidebarProps) {
  return (
    <div className="w-80 border-r border-border bg-card h-full hidden md:block">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Tin nhắn
          </h2>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-muted animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Chưa có tin nhắn nào</p>
              <p className="text-xs mt-1 opacity-70">
                Bắt đầu chat từ trang chi tiết xe
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl transition-all group relative overflow-hidden",
                    activeConversationId === conv.id
                      ? "bg-primary/10 text-foreground shadow-sm"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    {conv.postImage ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-1 ring-border">
                        <Image
                          src={conv.postImage}
                          alt={conv.otherUserName}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                          activeConversationId === conv.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {getInitials(conv.otherUserName)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold truncate text-sm">
                          {conv.otherUserName}
                        </h3>
                        {conv.unreadCount > 0 && (
                          <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                            {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                          </span>
                        )}
                      </div>

                      {conv.postTitle && (
                        <p className="text-[11px] text-primary/70 truncate mt-0.5">
                          🚗 {conv.postTitle}
                        </p>
                      )}

                      {conv.lastMessage && (
                        <p className="text-xs truncate mt-0.5 opacity-70">
                          {conv.lastMessage}
                        </p>
                      )}

                      {conv.lastMessageAt && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] opacity-50">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(conv.lastMessageAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
