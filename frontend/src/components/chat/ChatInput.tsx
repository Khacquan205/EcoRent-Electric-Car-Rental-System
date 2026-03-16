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
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (text.trim() && !isLoading && !disabled) {
      onSendMessage(text.trim());
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
      </div>
    </div>
  );
}
