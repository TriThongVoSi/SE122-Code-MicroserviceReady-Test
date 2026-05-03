# Firebase Chat Setup (MVP)

This setup enables Firebase-backed direct chat (`UC-CMN-03`) while keeping backend JWT auth/RBAC as the primary business auth source.

## Scope
- Firebase is used only for realtime direct message data.
- Backend does **not** implement REST chat message/conversation APIs.
- Backend only provides Firebase custom token bridge:
  - `POST /api/v1/firebase/chat-token`

## Identity Mapping
- Internal user id -> Firebase UID:
  - `u_<userId>`
- Example:
  - internal user `24` -> Firebase UID `u_24`
- Never use email/phone as Firebase UID.

## Required Environment Variables

### Frontend (`agricultural-crop-management-frontend/.env`)
- `VITE_CHAT_FIREBASE_ENABLED`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID` (optional)
- `VITE_FIREBASE_STORAGE_BUCKET` (optional)

### Backend (`agricultural-crop-management-backend/.env`)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT_JSON` **or** `FIREBASE_SERVICE_ACCOUNT_PATH`

## Backend Token Bridge Behavior
- Endpoint: `POST /api/v1/firebase/chat-token`
- Requires authenticated JWT session.
- Reads from security context:
  - `userId`
  - `role`
- Returns:
  - `appUid`
  - `role`
  - `customToken`
- Custom token claims:
  - `app_uid`
  - `role`
- No sensitive profile payload in response.

## Frontend Bootstrap Flow
1. User logs in with existing JWT flow.
2. Chat page calls `useChatBootstrap`.
3. Hook requests custom token from backend bridge.
4. Frontend calls Firebase `signInWithCustomToken`.
5. Firestore reads/writes run under Firebase auth uid `u_<userId>`.

## Data Model (Firestore)
- `conversations/{conversationId}`
  - `type` (`direct`)
  - `participantIds` (array of two UIDs)
  - `lastSeq`
  - `lastMessageText`
  - `lastMessageAt`
  - `lastMessageSenderUid`
- `conversations/{conversationId}/participants/{uid}`
  - `roleSnapshot`
  - `lastReadSeq`
  - `lastReadAt`
  - `joinedAt`
  - `archived`
- `conversations/{conversationId}/messages/{messageId}`
  - `seq`
  - `senderUid`
  - `text`
  - `createdAt`
  - `status`

## Read State
- Unread per conversation is derived by:
  - `unreadCount = max(0, lastSeq - lastReadSeq)`

## Security Rules
- MVP rules are in:
  - `docs/firebase/firestore.rules`

## Local/Test Notes
- If Firebase env/config is missing, app should not crash globally.
- Chat feature shows controlled error/disabled state.
- Tests should mock Firebase SDK behavior; no dependency on a real Firebase project.
