import { useCallback, useMemo, useState } from "react";
import { markConversationRead } from "../api/firestoreChatRepository";
import type { MarkReadInput } from "../model/types";

type UseMarkConversationReadResult = {
  isMarkingRead: boolean;
  error: string | null;
  markRead: (input: MarkReadInput) => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unable to update read state.";
}

export function useMarkConversationRead(
  currentUid: string | null
): UseMarkConversationReadResult {
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markRead = useCallback(
    async (input: MarkReadInput) => {
      if (!currentUid) {
        throw new Error("Chat is not ready yet.");
      }

      setIsMarkingRead(true);
      setError(null);
      try {
        await markConversationRead({
          currentUid,
          input,
        });
      } catch (markError) {
        setError(getErrorMessage(markError));
        throw markError;
      } finally {
        setIsMarkingRead(false);
      }
    },
    [currentUid]
  );

  return useMemo(
    () => ({
      isMarkingRead,
      error,
      markRead,
    }),
    [error, isMarkingRead, markRead]
  );
}
