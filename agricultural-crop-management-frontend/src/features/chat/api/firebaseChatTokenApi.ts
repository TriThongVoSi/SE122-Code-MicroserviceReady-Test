import { apiClient } from "@/shared/api/apiClient";

export type FirebaseChatTokenResponse = {
  appUid: string;
  role: string;
  customToken: string;
};

type FirebaseChatTokenApiPayload =
  | FirebaseChatTokenResponse
  | {
      result?: FirebaseChatTokenResponse;
    };

function normalizePayload(payload: FirebaseChatTokenApiPayload): FirebaseChatTokenResponse {
  const candidate = ("result" in payload ? payload.result : payload) as
    | Partial<FirebaseChatTokenResponse>
    | undefined;

  if (
    !candidate ||
    typeof candidate.appUid !== "string" ||
    typeof candidate.role !== "string" ||
    typeof candidate.customToken !== "string"
  ) {
    throw new Error("Invalid Firebase chat token response.");
  }

  return {
    appUid: candidate.appUid,
    role: candidate.role,
    customToken: candidate.customToken,
  };
}

export async function requestFirebaseChatToken(): Promise<FirebaseChatTokenResponse> {
  const response = await apiClient.post<FirebaseChatTokenApiPayload>(
    "/api/v1/firebase/chat-token"
  );

  return normalizePayload(response.data);
}
