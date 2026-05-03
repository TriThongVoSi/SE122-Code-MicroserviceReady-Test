import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ensureDirectConversation,
  subscribeConversations,
  toFirebaseChatUid,
} from "../api/firestoreChatRepository";
import type { ChatConversation } from "../model/types";

type UseConversationsResult = {
  conversations: ChatConversation[];
  isLoading: boolean;
  hasLoadedConversations: boolean;
  error: string | null;
  isStartingConversation: boolean;
  startDirectConversation: (peerUserId: string) => Promise<string>;
};

function getErrorMessage(error: unknown): string {
  const maybeFirebaseError = error as { code?: string; message?: string } | null;
  if (maybeFirebaseError?.code === "permission-denied") {
    return "Missing or insufficient permissions.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to load conversations.";
}

export function useConversations(
  currentUid: string | null,
  currentRole: string | null
): UseConversationsResult {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedConversations, setHasLoadedConversations] = useState(false);
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUid) {
      setConversations([]);
      setIsLoading(false);
      setHasLoadedConversations(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setHasLoadedConversations(false);
    setError(null);

    const unsubscribe = subscribeConversations({
      currentUid,
      onData: (data) => {
        setConversations(data);
        setIsLoading(false);
        setHasLoadedConversations(true);
      },
      onError: (subscribeError) => {
        setError(getErrorMessage(subscribeError));
        setIsLoading(false);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [currentUid]);

  const startDirectConversation = useCallback(
    async (peerUserId: string) => {
      if (!currentUid) {
        throw new Error("Chat is not ready yet.");
      }
      setIsStartingConversation(true);
      setError(null);

      try {
        const conversationId = await ensureDirectConversation({
          currentUid,
          currentRole,
          peerUid: toFirebaseChatUid(peerUserId),
        });
        return conversationId;
      } catch (startError) {
        const mappedError = getErrorMessage(startError);
        setError(mappedError);
        throw startError;
      } finally {
        setIsStartingConversation(false);
      }
    },
    [currentRole, currentUid]
  );

  return useMemo(
    () => ({
      conversations,
      isLoading,
      hasLoadedConversations,
      error,
      isStartingConversation,
      startDirectConversation,
    }),
    [
      conversations,
      error,
      hasLoadedConversations,
      isLoading,
      isStartingConversation,
      startDirectConversation,
    ]
  );
}
