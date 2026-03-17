import React, { useRef, useEffect } from "react";
import { MessageDto, ConversationDto } from "@/types/chat";
import { User, Check, CheckCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MessagesChatProps {
  conversation: ConversationDto | null;
  messages: MessageDto[];
  currentUserId: number;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function formatDateSeparator(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Hôm nay";
  if (d.toDateString() === yesterday.toDateString()) return "Hôm qua";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function shouldShowDateSeparator(
  current: MessageDto,
  previous: MessageDto | undefined,
): boolean {
  if (!previous) return true;
  const currentDate = new Date(current.createdAt).toDateString();
  const prevDate = new Date(previous.createdAt).toDateString();
  return currentDate !== prevDate;
}

export function MessagesChat({
  conversation,
  messages,
  currentUserId,
  isLoading,
  hasMore,
  onLoadMore,
}: MessagesChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleScroll = () => {
    if (!containerRef.current || !hasMore || isLoading) return;
    if (containerRef.current.scrollTop < 100) {
      onLoadMore?.();
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Chọn cuộc hội thoại</p>
          <p className="text-sm mt-1 opacity-70">
            Chọn một cuộc hội thoại bên trái để bắt đầu nhắn tin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
          {conversation.otherUserName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(-2)
            .toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate">
            {conversation.otherUserName}
          </h3>
          {conversation.postTitle && (
            <Link
              href={`/posts/${conversation.postId}`}
              className="text-[11px] text-primary hover:underline truncate block"
            >
              🚗 {conversation.postTitle}
            </Link>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-background"
      >
        {/* Load more indicator */}
        {hasMore && (
          <div className="text-center py-2">
            <button
              onClick={onLoadMore}
              disabled={isLoading}
              className="text-xs text-primary hover:underline disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin inline" />
              ) : (
                "Tải thêm tin nhắn cũ"
              )}
            </button>
          </div>
        )}

        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full text-muted-foreground opacity-70">
            <p>Hãy gửi tin nhắn đầu tiên!</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMine = msg.senderId === currentUserId;
          const showDate = shouldShowDateSeparator(msg, messages[idx - 1]);

          return (
            <React.Fragment key={msg.id}>
              {showDate && (
                <div className="flex items-center justify-center py-2">
                  <span className="text-[10px] text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {formatDateSeparator(msg.createdAt)}
                  </span>
                </div>
              )}

              <div
                className={cn(
                  "flex gap-2 max-w-[80%]",
                  isMine ? "ml-auto flex-row-reverse" : "mr-auto",
                )}
              >
                <div
                  className={cn(
                    "px-3.5 py-2 rounded-2xl shadow-sm relative group",
                    isMine
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border border-border text-foreground rounded-tl-sm",
                  )}
                >
                  {!isMine && (
                    <p className="text-[10px] font-semibold text-primary mb-0.5">
                      {msg.senderName}
                    </p>
                  )}
                  <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                  <div
                    className={cn(
                      "flex items-center gap-1 mt-1 text-[10px]",
                      isMine
                        ? "text-primary-foreground/60 justify-end"
                        : "text-muted-foreground",
                    )}
                  >
                    <span>{formatTime(msg.createdAt)}</span>
                    {isMine &&
                      (msg.isRead ? (
                        <CheckCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      ))}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {isLoading && messages.length === 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
}
