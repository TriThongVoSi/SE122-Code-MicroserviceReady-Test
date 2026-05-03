import { useEffect, useMemo, useState } from "react";
import { subscribeMessages } from "../api/firestoreChatRepository";
import type { ChatMessage } from "../model/types";

type UseMessagesResult = {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unable to load messages.";
}

export function useMessages(
  currentUid: string | null,
  conversationId: string | null
): UseMessagesResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUid || !conversationId) {
      setMessages([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeMessages({
      conversationId,
      onData: (data) => {
        setMessages(data);
        setIsLoading(false);
      },
      onError: (subscribeError) => {
        setError(getErrorMessage(subscribeError));
        setIsLoading(false);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId, currentUid]);

  return useMemo(
    () => ({
      messages,
      isLoading,
      error,
    }),
    [error, isLoading, messages]
  );
}
