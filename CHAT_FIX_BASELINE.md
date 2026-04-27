# CHAT FIX BASELINE (UC-CMN-03)

Generated at: 2026-04-27 (Asia/Bangkok)

## 1) Account identity baseline

Validated by real API login + `/api/v1/auth/me` + `/api/v1/firebase/chat-token`:

| Account | sign-in userId | /me userId | Username | Role | Firebase appUid |
|---|---:|---:|---|---|---|
| `farmer@acm.local` | 2 | 2 | farmer | FARMER | `u_2` |
| `farmer2@acm.local` | 4 | 4 | farmer2 | FARMER | `u_4` |

Required mapping `internal user id -> Firebase UID = u_<userId>` is valid for both test accounts.

## 2) FE Firebase bootstrap baseline

- FE custom token source: `POST /api/v1/firebase/chat-token`
  - `agricultural-crop-management-frontend/src/features/chat/api/firebaseChatTokenApi.ts`
- FE sign-in bridge:
  - `agricultural-crop-management-frontend/src/features/chat/model/useChatBootstrap.ts`
  - Calls Firebase `signInWithCustomToken`.
- Current UID used in chat flow is Firebase UID from authenticated Firebase user state.

## 3) Firestore model baseline (runtime code)

Source: `agricultural-crop-management-frontend/src/features/chat/api/chatFirestoreApi.ts`

### Collections
- `conversations`
- `conversations/{conversationId}/participants`
- `conversations/{conversationId}/messages`

### Conversation document shape (used by FE)
- `type` (`"direct"`)
- `participantIds` (`string[]`, expected Firebase UIDs)
- `lastSeq`
- `lastMessageText`
- `lastMessageAt`
- `lastMessageSenderUid`

### Message document shape (used by FE)
- `seq`
- `senderUid`
- `text`
- `createdAt`
- `status`

## 4) Query baseline (used by FE)

- List conversations:
  - `where("participantIds", "array-contains", currentUid)`
- List messages:
  - `collection("conversations", conversationId, "messages") + orderBy("seq", "asc")`

## 5) Pre-fix failure baseline

Observed before final fixes:

- Browser chat E2E failed while starting/opening direct conversation thread.
- UI frequently showed: `Missing or insufficient permissions.`
- Firestore realtime listeners returned permission-denied behavior (code 7 / insufficient permissions symptoms).
- FE `selectedConversationId` had fragile behavior when conversation list was empty or errored, causing thread state instability.
- Legacy direct REST `documents:runQuery` probes returned `403` (kept as baseline symptom record).
