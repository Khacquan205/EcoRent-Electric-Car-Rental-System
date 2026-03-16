import React from "react";
import { Conversation } from "@/types/chat";
<<<<<<< Updated upstream
import { PlusCircle, MessageSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
=======
import { MessageSquare, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
>>>>>>> Stashed changes

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewChat: () => void;
  isLoading?: boolean;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  isLoading,
}: ChatSidebarProps) {
  return (
<<<<<<< Updated upstream
    <div className="w-80 border-r border-border bg-card flex flex-col h-full hidden md:flex">
      <div className="p-4 border-b border-border">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <PlusCircle className="w-5 h-5" />
          Mới cuộc hội thoại
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Chưa có hội thoại nào</p>
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
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    activeConversationId === conv.id ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-background"
                  )}>
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-sm">
                      {conv.title || "Cuộc trò chuyện mới"}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] opacity-70">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(conv.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
=======
    <div className="flex flex-col h-full w-full md:w-80 border-r border-border bg-card">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Chat with AI</h2>
        <button
          onClick={onNewChat}
          className="p-2 text-primary hover:bg-accent rounded-full transition-colors flex items-center justify-center cursor-pointer"
          title="New Chat"
        >
          <PlusCircle className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {isLoading ? (
          <div className="space-y-3 p-2">
             {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
             ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No conversations yet. Start a new chat!
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={cn(
                "w-full text-left p-3 rounded-lg flex flex-col gap-1 transition-colors cursor-pointer",
                activeConversationId === conv.id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate flex-1 flex items-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4 opacity-70" />
                  {conv.title || "New Conversation"}
                </span>
                {conv.unreadCount ? (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                    {conv.unreadCount}
                  </span>
                ) : null}
              </div>
              <span className="text-xs opacity-70 ml-6">
                {format(new Date(conv.createdAt), "MMM d, h:mm a")}
              </span>
            </button>
          ))
>>>>>>> Stashed changes
        )}
      </div>
    </div>
  );
}
