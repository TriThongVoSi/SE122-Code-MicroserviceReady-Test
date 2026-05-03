import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatConversationList } from "./ChatConversationList";

describe("ChatConversationList", () => {
  it("renders conversations and triggers selection", () => {
    const onSelectConversation = vi.fn();
    const onStartConversation = vi.fn().mockResolvedValue(undefined);

    render(
      <ChatConversationList
        currentUid="u_1"
        conversations={[
          {
            id: "u_1__u_2",
            type: "direct",
            participantIds: ["u_1", "u_2"],
            peerUid: "u_2",
            lastMessageText: "Xin chao",
            lastMessageAt: new Date("2026-04-26T10:00:00.000Z"),
            lastMessageSenderUid: "u_2",
            lastSeq: 5,
            lastReadSeq: 2,
            unreadCount: 3,
          },
        ]}
        selectedConversationId={null}
        onSelectConversation={onSelectConversation}
        onStartConversation={onStartConversation}
        isLoading={false}
        isStartingConversation={false}
        error={null}
      />
    );

    expect(screen.getByText("User 2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /User 2/i }));
    expect(onSelectConversation).toHaveBeenCalledWith("u_1__u_2");
  });
});
