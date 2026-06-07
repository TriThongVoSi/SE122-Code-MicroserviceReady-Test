import type { RefObject } from "react";
import { ArrowLeft, ShoppingBag, Star, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib";
import {
  getChatDisplayName,
  getChatSubtitle,
  joinDefinedParts,
} from "../lib/chatDisplayHelpers";
import type { ChatConversation, ChatMessage } from "../model/types";
import { ChatWidgetEmptyState } from "./ChatWidgetEmptyState";
import { ChatWidgetInput } from "./ChatWidgetInput";
import { ChatWidgetMessageBubble } from "./ChatWidgetMessageBubble";

type ChatWidgetWindowProps = {
  conversation: ChatConversation | null;
  messages: ChatMessage[];
  currentUid: string | null;
  isMessagesLoading: boolean;
  isSending: boolean;
  error: string | null;
  onBack: () => void;
  onSend: (content: string) => Promise<void>;
  bottomRef: RefObject<HTMLDivElement>;
};

function getAvatarLabel(conversation: ChatConversation): string {
  return getChatDisplayName(conversation.peerProfile, conversation.peerUid)
    .slice(0, 1)
    .toUpperCase();
}

function getFarmId(conversation: ChatConversation): number | null {
  return conversation.peerProfile?.farmId ?? conversation.peerUserId ?? null;
}

function getFarmRating(conversation: ChatConversation): string {
  const rating = conversation.peerProfile?.ratingAverage;
  return typeof rating === "number" && rating > 0 ? rating.toFixed(1) : "4.8";
}

function isFarmActive(conversation: ChatConversation): boolean {
  return conversation.peerProfile?.isOnline ?? true;
}

export function ChatWidgetWindow({
  conversation,
  messages,
  currentUid,
  isMessagesLoading,
  isSending,
  error,
  onBack,
  onSend,
  bottomRef,
}: ChatWidgetWindowProps) {
  if (!conversation) {
    return (
      <main className="chat-widget-window chat-widget-window--empty">
        <ChatWidgetEmptyState />
      </main>
    );
  }

  const profile = conversation.peerProfile;
  const displayName = getChatDisplayName(profile, conversation.peerUid);
  const subtitle = joinDefinedParts([getChatSubtitle(profile), profile?.address], " - ");
  const farmId = getFarmId(conversation);
  const ratingLabel = getFarmRating(conversation);
  const isActive = isFarmActive(conversation);

  return (
    <main className="chat-widget-window">
      <header className="chat-widget-thread-header">
        <button
          type="button"
          className="chat-widget-back"
          aria-label="Back to conversations"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="chat-widget-thread-header__identity">
          <div className="chat-widget-avatar chat-widget-avatar--header" aria-hidden="true">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" referrerPolicy="no-referrer" />
            ) : (
              getAvatarLabel(conversation)
            )}
            <span
              className={cn(
                "chat-widget-avatar__status-dot",
                !isActive && "chat-widget-avatar__status-dot--offline",
              )}
            />
          </div>

          <div className="chat-widget-farm-card">
            <div className="chat-widget-farm-card__main">
              <h3 className="chat-widget-thread-header__name">
                <span>{displayName}</span>
              </h3>
              {subtitle ? <p>{subtitle}</p> : null}
              <div className="chat-widget-farm-card__meta">
                <span className="chat-widget-farm-card__rating">
                  <Star className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{ratingLabel}</span>
                </span>
                <span
                  className={cn(
                    "chat-widget-farm-card__activity",
                    !isActive && "chat-widget-farm-card__activity--offline",
                  )}
                >
                  <span aria-hidden="true" />
                  {isActive ? "Đang hoạt động" : "Không hoạt động"}
                </span>
              </div>
            </div>

            {farmId ? (
              <div className="chat-widget-farm-card__actions">
                <Button asChild size="sm" className="chat-widget-farm-card__button">
                  <Link to={`/marketplace/farms/${farmId}`}>
                    <Store className="h-3.5 w-3.5" aria-hidden="true" />
                    Xem nông trại
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="chat-widget-farm-card__button chat-widget-farm-card__button--secondary"
                >
                  <Link to={`/marketplace/products?farmId=${farmId}`}>
                    <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                    Xem sản phẩm
                  </Link>
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="chat-widget-messages" aria-live="polite">
        {isMessagesLoading ? <p className="chat-widget-muted">Đang tải tin nhắn...</p> : null}
        {error ? <p className="chat-widget-error">{error}</p> : null}
        {!isMessagesLoading && !error && messages.length === 0 ? (
          <p className="chat-widget-muted">Chưa có tin nhắn nào.</p>
        ) : null}
        {messages.map((message) => (
          <ChatWidgetMessageBubble
            key={message.id}
            message={message}
            currentUid={currentUid}
            peerLabel={displayName}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <ChatWidgetInput disabled={!conversation} isSending={isSending} onSend={onSend} />
    </main>
  );
}
