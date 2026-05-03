import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatComposerProps = {
  disabled: boolean;
  isSending: boolean;
  onSend: (text: string) => Promise<void>;
  error: string | null;
};

export function ChatComposer({
  disabled,
  isSending,
  onSend,
  error,
}: ChatComposerProps) {
  const [text, setText] = useState("");

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || isSending) {
      return;
    }

    await onSend(trimmed);
    setText("");
  };

  return (
    <div className="border-t border-[#E8EEDC] bg-white p-3 space-y-2">
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Nhập tin nhắn..."
        rows={3}
        disabled={disabled || isSending}
      />
      <div className="flex items-center justify-between gap-2">
        {error ? <p className="text-xs text-red-600">{error}</p> : <span />}
        <Button
          type="button"
          disabled={disabled || isSending || !text.trim()}
          onClick={() => {
            void handleSend();
          }}
        >
          {isSending ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
