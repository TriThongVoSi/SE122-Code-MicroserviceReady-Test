import { useCallback, useMemo, useState } from "react";
import {
  sendDirectMessage,
  toFirebaseChatUid,
} from "../api/firestoreChatRepository";
import type { SendChatMessageInput } from "../model/types";

type UseSendMessageResult = {
  isSending: boolean;
  error: string | null;
  sendMessage: (input: SendChatMessageInput) => Promise<{ conversationId: string; seq: number }>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unable to send message.";
}

export function useSendMessage(
  currentUid: string | null,
  currentRole: string | null
): UseSendMessageResult {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (input: SendChatMessageInput) => {
      if (!currentUid) {
        throw new Error("Chat is not ready yet.");
      }

      setIsSending(true);
      setError(null);

      try {
        const response = await sendDirectMessage({
          currentUid,
          currentRole,
          input: {
            ...input,
            peerUid: input.peerUid ? toFirebaseChatUid(input.peerUid) : input.peerUid,
          },
        });
        return response;
      } catch (sendError) {
        setError(getErrorMessage(sendError));
        throw sendError;
      } finally {
        setIsSending(false);
      }
    },
    [currentRole, currentUid]
  );

  return useMemo(
    () => ({
      isSending,
      error,
      sendMessage,
    }),
    [error, isSending, sendMessage]
  );
}
