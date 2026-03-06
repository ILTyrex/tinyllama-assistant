import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface ChatInputProps {
  onSend: (msg: string) => void;
  onReset: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function ChatInput({
  onSend,
  onReset,
  disabled,
  loading,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = Math.min(ref.current.scrollHeight, 160) + "px";
    }
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-border">
      <div className="glass-surface flex items-end gap-2 p-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-9 w-9 flex-shrink-0"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          rows={1}
          className="flex-1 bg-transparent border-0 outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground py-2 scrollbar-thin"
          disabled={disabled}
        />

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground h-9 w-9"
            title="Reiniciar conversación"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!value.trim() || disabled}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 w-9"
          >
            {loading ? (
              <Spinner
                size="sm"
                className="border-primary-foreground/30 border-t-primary-foreground"
              />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
