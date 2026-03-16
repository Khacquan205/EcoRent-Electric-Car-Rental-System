<<<<<<< Updated upstream
import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onSuggestCars: (text?: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSendMessage,
  onSuggestCars,
  isLoading,
  disabled,
}: ChatInputProps) {
=======
import React, { useState, useRef, KeyboardEvent } from "react";
import { Send, CarFront } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onSuggestCars?: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, onSuggestCars, isLoading, disabled }: ChatInputProps) {
>>>>>>> Stashed changes
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (text.trim() && !isLoading && !disabled) {
      onSendMessage(text.trim());
      setText("");
<<<<<<< Updated upstream
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
=======
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
>>>>>>> Stashed changes
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

<<<<<<< Updated upstream
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  return (
    <div className="p-4 bg-background border-t border-border">
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        <div className="flex items-end gap-2 bg-muted/50 rounded-2xl p-2 border border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={disabled || isLoading}
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 px-3 text-[15px] min-h-10 max-h-30"
          />

          <button
            onClick={handleSend}
            disabled={!text.trim() || isLoading || disabled}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shrink-0 shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              const requestText = text.trim();
              onSuggestCars(requestText || undefined);
              if (requestText) {
                setText("");
              }
            }}
            disabled={isLoading || disabled}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors border border-primary/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Gợi ý xe cho tôi
          </button>
        </div>
=======
  const adjustHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
    }
  };

  return (
    <div className="p-4 bg-background border-t border-border">
      <div className="max-w-4xl mx-auto flex items-end gap-2 bg-card border border-border rounded-2xl p-2 shadow-sm focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-shadow">
        
        {onSuggestCars && (
          <button
            type="button"
            onClick={onSuggestCars}
            disabled={isLoading || disabled}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
            title="Suggest cars for me"
          >
            <CarFront className="w-5 h-5" />
          </button>
        )}

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isLoading || disabled}
          className="flex-1 max-h-[150px] min-h-[40px] resize-none bg-transparent py-2.5 px-3 focus:outline-none text-[15px] disabled:opacity-50 scrollbar-hide"
          rows={1}
        />

        <button
          onClick={handleSend}
          disabled={!text.trim() || isLoading || disabled}
          className={cn(
            "p-2.5 rounded-full flex items-center justify-center transition-all flex-shrink-0 cursor-pointer",
            text.trim() && !isLoading && !disabled
              ? "bg-primary text-primary-foreground hover:opacity-90 shadow-md"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <div className="text-center mt-2 text-[11px] text-muted-foreground opacity-60">
        AI can make mistakes. Consider verifying important information.
>>>>>>> Stashed changes
      </div>
    </div>
  );
}
