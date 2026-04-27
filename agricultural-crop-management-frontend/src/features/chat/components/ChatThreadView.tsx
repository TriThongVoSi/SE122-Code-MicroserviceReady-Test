import type { ChatMessage } from "../model/types";

type ChatThreadViewProps = {
  messages: ChatMessage[];
  currentUid: string | null;
  isLoading: boolean;
  error: string | null;
  hasConversationSelected: boolean;
};

function formatTime(value: Date | null): string {
  if (!value) {
    return "";
  }
  return value.toLocaleTimeString();
}

export function ChatThreadView({
  messages,
  currentUid,
  isLoading,
  error,
  hasConversationSelected,
}: ChatThreadViewProps) {
  if (!hasConversationSelected) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-slate-500">
        Chọn một cuộc hội thoại để bắt đầu.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-slate-500">
        Loading messages...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-slate-500">
        Chưa có tin nhắn. Gửi tin đầu tiên ở khung bên dưới.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-3 space-y-3 bg-[#FAFCF7]" data-chat-panel="thread">
      {messages.map((message) => {
        const isMine = currentUid === message.senderUid;
        return (
          <div
            key={message.id}
            data-message-id={message.id}
            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-md px-3 py-2 text-sm shadow-sm ${
                isMine
                  ? "bg-[#D6F0B8] text-[#1E2B15]"
                  : "bg-white border border-[#E8EEDC] text-[#2E3A27]"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
              <p className="text-[11px] text-slate-500 mt-1 text-right">
                #{message.seq} {formatTime(message.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
