export type ChatBootstrapStatus = "idle" | "disabled" | "loading" | "ready" | "error";

export type ChatConversation = {
  id: string;
  type: "direct";
  participantIds: string[];
  peerUid: string;
  lastMessageText: string;
  lastMessageAt: Date | null;
  lastMessageSenderUid: string | null;
  lastSeq: number;
  lastReadSeq: number;
  unreadCount: number;
};

export type ChatMessage = {
  id: string;
  seq: number;
  senderUid: string;
  text: string;
  createdAt: Date | null;
  status: "sent";
};

export type SendChatMessageInput = {
  conversationId?: string | null;
  peerUid?: string | null;
  text: string;
};

export type MarkReadInput = {
  conversationId: string;
  lastReadSeq: number;
};
