import { signInWithCustomToken } from "firebase/auth";
import httpClient from "@/shared/api/http";
import { getChatAuth } from "./firebaseApp";
import { getFirebaseEnvStatus } from "./firebaseEnv";

type FirebaseChatTokenResult = {
  appUid: string;
  role: string;
  customToken: string;
};

type FirebaseChatTokenApiResponse = {
  result?: {
    appUid?: string;
    role?: string;
    customToken?: string;
  };
};

function parseTokenResponse(payload: FirebaseChatTokenApiResponse): FirebaseChatTokenResult {
  const appUid = payload.result?.appUid;
  const role = payload.result?.role;
  const customToken = payload.result?.customToken;

  if (!appUid || !role || !customToken) {
    throw new Error("Invalid Firebase chat token response.");
  }

  return {
    appUid,
    role,
    customToken,
  };
}

export async function requestFirebaseChatToken(): Promise<FirebaseChatTokenResult> {
  const response = await httpClient.post<FirebaseChatTokenApiResponse>(
    "/api/v1/firebase/chat-token"
  );
  return parseTokenResponse(response.data);
}

export async function signInToFirebaseChat(expectedAppUid: string): Promise<FirebaseChatTokenResult> {
  const envStatus = getFirebaseEnvStatus();
  if (!envStatus.enabled) {
    throw new Error("Firebase Chat is disabled by environment flag.");
  }
  if (!envStatus.valid) {
    throw new Error(`Firebase Chat env missing: ${envStatus.missingKeys.join(", ")}`);
  }

  const auth = getChatAuth();
  if (auth.currentUser?.uid === expectedAppUid) {
    return {
      appUid: expectedAppUid,
      role: "unknown",
      customToken: "",
    };
  }

  const tokenResult = await requestFirebaseChatToken();
  await signInWithCustomToken(auth, tokenResult.customToken);

  if (auth.currentUser?.uid !== tokenResult.appUid) {
    throw new Error("Firebase UID mismatch after custom token sign-in.");
  }
  if (tokenResult.appUid !== expectedAppUid) {
    throw new Error("Backend Firebase UID does not match current authenticated user.");
  }

  return tokenResult;
}
