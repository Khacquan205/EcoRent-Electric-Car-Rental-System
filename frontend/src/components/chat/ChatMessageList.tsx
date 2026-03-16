import React, { useRef, useEffect, useState } from "react";
import { ChatMessage } from "@/types/chat";
import { User, Sparkles, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { PostListItemDto } from "@/types/api";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=450&fit=crop";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

function SuggestedPostsCarousel({ posts }: { posts: PostListItemDto[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const movedRef = useRef(false);
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (!trackRef.current) return;

    pointerDownRef.current = true;
    movedRef.current = false;
    setIsDragging(true);
    startXRef.current = e.pageX;
    startScrollLeftRef.current = trackRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pointerDownRef.current || !trackRef.current) return;
    const deltaX = e.pageX - startXRef.current;
    if (Math.abs(deltaX) > 4) {
      movedRef.current = true;
    }
    trackRef.current.scrollLeft = startScrollLeftRef.current - deltaX;
  };

  const handleMouseUpOrLeave = () => {
    if (movedRef.current) {
      suppressClickRef.current = true;
    }
    pointerDownRef.current = false;
    setIsDragging(false);
  };

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!suppressClickRef.current) return;
    e.preventDefault();
    suppressClickRef.current = false;
  };

  return (
    <div className="mt-4">
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={cn(
          "flex gap-3 overflow-x-auto pb-2 pr-1 snap-x snap-mandatory select-none [&::-webkit-scrollbar]:hidden",
          isDragging ? "cursor-grabbing" : "cursor-grab",
        )}
        style={{ scrollbarWidth: "none" }}
      >
        {posts.map((post) => {
          const firstImage = post.images?.[0] ?? null;
          const hasImages = Boolean(firstImage);
          return (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              onClick={handleCardClick}
              onDragStart={(e) => e.preventDefault()}
              className="group flex items-stretch gap-3 p-2.5 border border-border/60 rounded-xl bg-card/80 text-sm hover:shadow-md hover:bg-card hover:border-border transition-all min-w-80 w-80 sm:min-w-96 sm:w-96 hover:-translate-y-0.5 snap-start"
            >
              <div className="relative w-28 h-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-border/50">
                {hasImages ? (
                  <Image
                    src={firstImage!}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                    draggable={false}
                  />
                ) : (
                  <>
                    <Image
                      src={PLACEHOLDER_IMAGE}
                      alt="Chưa có ảnh"
                      fill
                      className="object-cover opacity-30"
                      unoptimized
                      draggable={false}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageOff className="h-5 w-5 text-gray-400/80" />
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col flex-1 justify-between py-0.5 overflow-hidden">
                <div>
                  <h4 className="font-semibold text-foreground line-clamp-2 text-sm leading-snug group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-muted-foreground text-[11px] mt-1 line-clamp-1">
                    {post.categoryName}
                  </p>
                  {post.matchReasons && post.matchReasons.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {post.matchReasons.slice(0, 2).map((reason) => (
                        <span
                          key={`${post.id}-${reason}`}
                          className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-medium"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-blue-600 font-bold text-sm mt-1.5 flex items-baseline gap-1">
                  {post.price.toLocaleString("vi-VN")}{" "}
                  <span className="text-[10px] text-muted-foreground font-normal">
                    đ/ngày
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-background">
      {messages.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-70">
          <Sparkles className="w-12 h-12 mb-4 text-primary" />
          <p>Send a message to start chatting with EcoRent AI.</p>
        </div>
      ) : (
        messages.map((msg) => {
          const isUser = msg.senderRole === "user";

          return (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                isUser
                  ? "ml-auto flex-row-reverse max-w-[85%]"
                  : "mr-auto w-full max-w-[96%]",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 shrink-0 rounded-full flex items-center justify-center",
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground",
                )}
              >
                {isUser ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Sparkles className="w-5 h-5 text-primary" />
                )}
              </div>

              <div
                className={cn(
                  "p-3 rounded-2xl shadow-sm relative group",
                  isUser
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card border border-border text-foreground rounded-tl-sm w-full",
                )}
              >
                <div className="whitespace-pre-wrap text-[15px] leading-relaxed wrap-break-word">
                  {msg.content}
                </div>

                {msg.suggestedPosts && msg.suggestedPosts.length > 0 && (
                  <SuggestedPostsCarousel posts={msg.suggestedPosts} />
                )}
              </div>
            </div>
          );
        })
      )}

      {isLoading && (
        <div className="flex gap-3 max-w-[85%] mr-auto">
          <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-card border border-border text-foreground">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border rounded-tl-sm flex items-center gap-1.5 h-12">
            <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse"></span>
          </div>
        </div>
      )}

      <div ref={bottomRef} className="h-1" />
    </div>
  );
}
