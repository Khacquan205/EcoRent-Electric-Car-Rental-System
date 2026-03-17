import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface MessagesInputProps {
  onSendMessage: (text: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function MessagesInput({
  onSendMessage,
  isLoading,
  disabled,
}: MessagesInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (trimmed && !isLoading && !disabled) {
      onSendMessage(trimmed);
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
      <div className="flex items-end gap-2 bg-muted/50 rounded-2xl p-2 border border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
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
    </div>
  );
}
