# CHAT FIX REPORT (UC-CMN-03)

Generated at: 2026-04-27 (Asia/Bangkok)

## 1) Root cause chính

### Root cause A: Firestore conversation read/list rules không tương thích ổn định với realtime query
- Chat FE list conversations bằng query:
  - `where("participantIds", "array-contains", currentUid)`
- Rules cũ dùng pattern đọc participant qua `get(...)` theo context không tối ưu cho list/query realtime và gây permission-denied trong flow thực.
- Kết quả: conversation listener lỗi, UI không thấy thread list ổn định.

### Root cause B: ChatPage reset thread quá sớm khi list rỗng
- Trước khi sửa, `ChatPage` reset `selectedConversationId` khi selected item không nằm trong list hiện tại.
- Khi list tạm rỗng hoặc lỗi (permission/network), UI coi như “không có conversation” và làm mất thread đang mở.

### Root cause C: Identity guard ở FE chưa chặt để bắt mismatch sớm
- FE đã dùng bridge token nhưng thiếu check chặt giữa:
  - internal user id
  - `tokenResponse.appUid`
  - Firebase authenticated UID thực tế (`credential.user.uid`)
- Đã thêm guard để fail fast nếu lệch mapping.

## 2) Files đã sửa

- `docs/firebase/firestore.rules`
- `agricultural-crop-management-frontend/src/features/chat/model/useChatBootstrap.ts`
- `agricultural-crop-management-frontend/src/features/chat/api/chatFirestoreApi.ts`
- `agricultural-crop-management-frontend/src/features/chat/hooks/useConversations.ts`
- `agricultural-crop-management-frontend/src/pages/chat/ChatPage.tsx`
- `agricultural-crop-management-frontend/src/features/chat/components/ChatConversationList.tsx`
- `agricultural-crop-management-frontend/src/features/chat/components/ChatThreadView.tsx`
- `agricultural-crop-management-frontend/tmp-chat-e2e.spec.ts`

## 3) Tóm tắt patch

### 3.1 Firestore rules
- Cập nhật rule đọc `conversations` theo participant trực tiếp trên `resource.data.participantIds`.
- Giữ chặt create/update direct conversation:
  - `type == "direct"`
  - `participantIds` là list 2 phần tử UID hợp lệ `u_<number>`
  - không duplicate participant
- Message create chỉ cho participant, sender phải trùng `request.auth.uid`, text length hợp lệ.
- Deploy rules thực tế lên project:
  - `nen-tang-quan-ly-mua-vu-voi-ai`

### 3.2 FE state guard (khắc phục reset sai)
- Thêm state `hasLoadedConversations` trong `useConversations`.
- `ChatPage` chỉ reset selected thread khi:
  - list đã load thành công,
  - không có lỗi,
  - selected conversation thực sự không còn trong list hợp lệ.
- Không reset chỉ vì `conversations.length === 0` trong giai đoạn lỗi/loading.

### 3.3 Identity mapping guard
- `useChatBootstrap` kiểm tra chặt:
  - expected `u_${user.id}`
  - `tokenResponse.appUid`
  - Firebase signed-in UID thực (`credential.user.uid`)
- Nếu mismatch -> fail explicit error.

### 3.4 Chat runtime robustness
- Chuẩn hóa `currentUid`/`peerUid` về Firebase UID (`u_<id>`) trong Firestore API.
- Tránh làm sập toàn bộ conversation list khi participant metadata doc tạm unavailable (fallback an toàn).

### 3.5 E2E automation/reporting
- Nâng cấp Playwright E2E 2-context:
  - Login 2 account
  - Open `/chat`
  - Start direct conversation
  - 2 chiều gửi/nhận realtime
  - Screenshot thành công
- JSON report đã chứa:
  - `step`, `error`
  - `consoleErrors`, `networkErrors`, `firestorePermissionErrors`
  - mỗi account có `firebaseUid`, `selectedConversationId`, `conversationsCount`, `messagesCount`

## 4) Firestore rules trước/sau (mức giải thích)

### Trước
- Rule đọc/list conversation dựa nhiều vào `get(...)` helper ở context không ổn định cho query/list realtime.
- Dẫn đến permission-denied trong luồng list thread.

### Sau
- Read/list conversation dùng trực tiếp participant check trên `resource.data`.
- Subcollection messages/participants kiểm tra participant theo conversation parent rõ ràng.
- Rule vẫn chặt, không mở `allow read, write: if true`.

## 5) Identity mapping verified

Validated bằng API thực (`sign-in` + `/me` + `/firebase/chat-token`):

- `farmer@acm.local`: internal id `2` -> Firebase UID `u_2`
- `farmer2@acm.local`: internal id `4` -> Firebase UID `u_4`

## 6) E2E result (browser thật)

Theo run thành công mới nhất (`tmp-chat-browser-report.json`):

- login farmer: **pass**
- login farmer2: **pass**
- open `/chat`: **pass**
- start conversation: **pass**
- send farmer2 -> farmer: **pass**
- send farmer -> farmer2: **pass**

Artifacts:
- `tmp-chat-browser-report.json`
- `tmp-chat-farmer.png`
- `tmp-chat-farmer2.png`

## 7) Commands đã chạy và kết quả

### Frontend
- `npx vitest --run src/features/chat/api/firestoreChatRepository.test.ts src/features/chat/components/ChatConversationList.test.tsx src/features/chat/hooks/useChatBootstrap.test.tsx`
  - **PASS** (9 tests)
- `npx eslint src/features/chat src/pages/chat/ChatPage.tsx`
  - **PASS**
- `npm run typecheck`
  - **FAIL (unrelated existing failure)**
  - lỗi ở `src/shared/api/marketplace/mock-adapter.ts` (type mismatch marketplace), ngoài phạm vi chat/firebase.

### Backend
- `mvn "-Dtest=FirebaseChatTokenServiceTest,FirebaseChatControllerTest" test`
  - **PASS** (5 tests)

### Firebase rules
- `firebase deploy --only firestore:rules --project nen-tang-quan-ly-mua-vu-voi-ai`
  - **PASS** (compiled + released)

### Playwright E2E
- `npx playwright test tmp-chat-e2e.spec.ts --config=tmp-playwright.config.mjs`
  - **PASS** (1 test)

## 8) Lỗi còn lại / phân loại

- **P0 blocking chat**: Không còn.
- **P1 UX/non-blocking**:
  - Một số `net::ERR_ABORTED` font request (`fonts.gstatic.com`) trong headless run, không ảnh hưởng chat flow.
- **Unrelated existing failure**:
  - FE `typecheck` fail ở module marketplace, không thuộc phạm vi chat/firebase.

## 9) Kết luận theo tiêu chí hoàn thành

Đã đạt các tiêu chí chính:
- Không còn permission-denied trong chat flow thực tế E2E pass.
- Cả 2 tài khoản mở thread và trao đổi message realtime thành công.
- `selectedConversationId` không còn bị reset sai khi list rỗng do trạng thái lỗi/loading.
- Playwright E2E 2 account pass thật, có report + screenshot chứng minh.
