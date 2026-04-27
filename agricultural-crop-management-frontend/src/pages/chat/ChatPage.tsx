import { useEffect, useMemo, useRef, useState } from "react";
import { ChatComposer } from "@/features/chat/components/ChatComposer";
import { ChatConversationList } from "@/features/chat/components/ChatConversationList";
import { ChatThreadView } from "@/features/chat/components/ChatThreadView";
import { useConversations } from "@/features/chat/hooks/useConversations";
import { useMarkConversationRead } from "@/features/chat/hooks/useMarkConversationRead";
import { useMessages } from "@/features/chat/hooks/useMessages";
import { useSendMessage } from "@/features/chat/hooks/useSendMessage";
import { useChatBootstrap } from "@/features/chat/model/useChatBootstrap";

export function ChatPage() {
  const bootstrap = useChatBootstrap();

  const currentUid = bootstrap.status === "ready" ? bootstrap.appUid : null;
  const currentRole = bootstrap.status === "ready" ? bootstrap.role : null;

  const {
    conversations,
    isLoading: isConversationsLoading,
    hasLoadedConversations,
    isStartingConversation,
    error: conversationError,
    startDirectConversation,
  } = useConversations(currentUid, currentRole);

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId]
  );

  const messagesState = useMessages(currentUid, selectedConversationId);
  const sendState = useSendMessage(currentUid, currentRole);
  const markReadState = useMarkConversationRead(currentUid);
  const markedReadTrackerRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
      return;
    }

    if (!selectedConversationId || selectedConversation) {
      return;
    }

    // Avoid clearing an active thread while conversation query is loading or failed.
    if (
      isConversationsLoading ||
      !hasLoadedConversations ||
      Boolean(conversationError)
    ) {
      return;
    }

    // At this point the list is loaded successfully and the selected thread is not valid anymore.
    setSelectedConversationId(conversations[0]?.id ?? null);
  }, [
    conversationError,
    conversations,
    hasLoadedConversations,
    isConversationsLoading,
    selectedConversation,
    selectedConversationId,
  ]);

  useEffect(() => {
    if (!selectedConversationId || !currentUid) {
      return;
    }

    const latestSeq =
      messagesState.messages[messagesState.messages.length - 1]?.seq ??
      selectedConversation?.lastSeq ??
      0;

    if (latestSeq <= 0) {
      return;
    }

    const previousMarkedSeq = markedReadTrackerRef.current[selectedConversationId] ?? 0;
    if (latestSeq <= previousMarkedSeq) {
      return;
    }

    markedReadTrackerRef.current[selectedConversationId] = latestSeq;
    void markReadState.markRead({
      conversationId: selectedConversationId,
      lastReadSeq: latestSeq,
    });
  }, [
    currentUid,
    markReadState,
    messagesState.messages,
    selectedConversation?.lastSeq,
    selectedConversationId,
  ]);

  const handleStartConversation = async (peerUserId: string) => {
    const conversationId = await startDirectConversation(peerUserId);
    setSelectedConversationId(conversationId);
  };

  const handleSendMessage = async (text: string) => {
    await sendState.sendMessage({
      conversationId: selectedConversationId,
      text,
    });
  };

  if (bootstrap.status === "disabled") {
    return (
      <section className="min-h-screen bg-[#F8F8F4] p-6">
        <div className="max-w-3xl mx-auto bg-white border border-[#D8E0CC] rounded-md p-4">
          <h1 className="text-xl font-semibold text-[#2E3A27]">Chat</h1>
          <p className="text-sm text-slate-600 mt-2">{bootstrap.error}</p>
        </div>
      </section>
    );
  }

  if (bootstrap.status === "loading") {
    return (
      <section className="min-h-screen bg-[#F8F8F4] p-6">
        <div className="max-w-3xl mx-auto bg-white border border-[#D8E0CC] rounded-md p-4 text-sm text-slate-600">
          Initializing Firebase chat...
        </div>
      </section>
    );
  }

  if (bootstrap.status === "error") {
    return (
      <section className="min-h-screen bg-[#F8F8F4] p-6">
        <div className="max-w-3xl mx-auto bg-white border border-[#F1C7C7] rounded-md p-4">
          <h1 className="text-xl font-semibold text-[#8B2C2C]">Chat bootstrap failed</h1>
          <p className="text-sm text-red-700 mt-2">{bootstrap.error}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="min-h-screen bg-[#F8F8F4] p-4 sm:p-6"
      data-chat-current-uid={currentUid ?? ""}
      data-chat-selected-conversation-id={selectedConversationId ?? ""}
      data-chat-conversations-count={String(conversations.length)}
      data-chat-messages-count={String(messagesState.messages.length)}
    >
      <div className="mx-auto max-w-7xl h-[calc(100vh-3rem)] grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        <ChatConversationList
          currentUid={currentUid}
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          onStartConversation={handleStartConversation}
          isLoading={isConversationsLoading}
          isStartingConversation={isStartingConversation}
          error={conversationError}
        />

        <section className="border border-[#D8E0CC] rounded-md bg-white h-full flex flex-col">
          <header className="px-4 py-3 border-b border-[#E8EEDC]">
            <h2 className="text-base font-semibold text-[#2E3A27]">
              {selectedConversation
                ? `Thread: ${selectedConversation.peerUid}`
                : "Conversation thread"}
            </h2>
          </header>

          <div className="flex-1 min-h-0">
            <ChatThreadView
              messages={messagesState.messages}
              currentUid={currentUid}
              isLoading={messagesState.isLoading}
              error={messagesState.error}
              hasConversationSelected={!!selectedConversationId}
            />
          </div>

          <ChatComposer
            disabled={!selectedConversationId}
            isSending={sendState.isSending}
            onSend={handleSendMessage}
            error={sendState.error || markReadState.error}
          />
        </section>
      </div>
    </section>
  );
}
