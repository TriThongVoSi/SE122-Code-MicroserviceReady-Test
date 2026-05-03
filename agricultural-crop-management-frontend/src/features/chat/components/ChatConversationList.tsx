import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChatConversation } from "../model/types";

type ChatConversationListProps = {
  currentUid: string | null;
  conversations: ChatConversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onStartConversation: (peerUserId: string) => Promise<void>;
  isLoading: boolean;
  isStartingConversation: boolean;
  error: string | null;
};

function formatTime(value: Date | null): string {
  if (!value) {
    return "";
  }
  return value.toLocaleString();
}

function peerLabel(uid: string): string {
  return uid.startsWith("u_") ? `User ${uid.slice(2)}` : uid;
}

export function ChatConversationList({
  currentUid,
  conversations,
  selectedConversationId,
  onSelectConversation,
  onStartConversation,
  isLoading,
  isStartingConversation,
  error,
}: ChatConversationListProps) {
  const [peerInput, setPeerInput] = useState("");

  const currentUserIdLabel = useMemo(() => {
    if (!currentUid) {
      return null;
    }

    if (!currentUid.startsWith("u_")) {
      return currentUid;
    }

    return `#${currentUid.slice(2)}`;
  }, [currentUid]);

  const sortedConversations = useMemo(
    () =>
      [...conversations].sort((left, right) => {
        const leftTime = left.lastMessageAt?.getTime() ?? 0;
        const rightTime = right.lastMessageAt?.getTime() ?? 0;
        return rightTime - leftTime;
      }),
    [conversations]
  );

  const handleStartConversation = async () => {
    const trimmedPeerInput = peerInput.trim();
    if (!trimmedPeerInput || isStartingConversation) {
      return;
    }

    try {
      await onStartConversation(trimmedPeerInput);
      setPeerInput("");
    } catch {
      // Error state is surfaced by useConversations and rendered in this panel.
    }
  };

  return (
    <aside
      className="border border-[#D8E0CC] rounded-md bg-white h-full flex flex-col"
      data-chat-panel="conversation-list"
      data-chat-conversations-count={String(conversations.length)}
    >
      <div className="p-3 border-b border-[#E8EEDC] space-y-2">
        <p className="text-sm font-semibold text-[#2E3A27]">Direct conversations</p>
        {currentUserIdLabel ? (
          <p className="text-xs text-slate-500">Your user ID: {currentUserIdLabel}</p>
        ) : null}
        <div className="flex gap-2">
          <Input
            placeholder="Enter internal user ID (example: 2 or #2)"
            value={peerInput}
            onChange={(event) => setPeerInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleStartConversation();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={!peerInput.trim() || isStartingConversation}
            onClick={() => {
              void handleStartConversation();
            }}
          >
            Start
          </Button>
        </div>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <p className="px-3 py-4 text-sm text-slate-500">Loading conversations...</p>
        ) : null}

        {!isLoading && sortedConversations.length === 0 ? (
          <p className="px-3 py-4 text-sm text-slate-500">
            No conversation yet. Enter a user ID to start direct chat.
          </p>
        ) : null}

        {sortedConversations.map((conversation) => {
          const isSelected = selectedConversationId === conversation.id;
          return (
            <button
              key={conversation.id}
              type="button"
              data-conversation-id={conversation.id}
              data-selected={isSelected ? "true" : "false"}
              className={`w-full text-left border-b border-[#EFF4E7] px-3 py-3 transition ${
                isSelected ? "bg-[#EAF4D7]" : "hover:bg-[#F7FAF1]"
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm text-[#2E3A27]">
                  {peerLabel(conversation.peerUid)}
                </p>
                {conversation.unreadCount > 0 ? (
                  <Badge variant="secondary">{conversation.unreadCount}</Badge>
                ) : null}
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                {conversation.lastMessageText || "No messages yet"}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {formatTime(conversation.lastMessageAt)}
              </p>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
