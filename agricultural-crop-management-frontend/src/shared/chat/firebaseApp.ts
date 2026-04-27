import { initializeApp, type FirebaseApp, getApps, getApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseEnvStatus } from "./firebaseEnv";

type FirebaseChatRuntime = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
};

let runtimeCache: FirebaseChatRuntime | null = null;

export function getFirebaseChatRuntime(): FirebaseChatRuntime {
  if (runtimeCache) {
    return runtimeCache;
  }

  const envStatus = getFirebaseEnvStatus();
  if (!envStatus.enabled) {
    throw new Error("Firebase Chat is disabled. Set VITE_CHAT_FIREBASE_ENABLED=true.");
  }
  if (!envStatus.valid || !envStatus.config) {
    throw new Error(
      `Firebase Chat env is incomplete: missing ${envStatus.missingKeys.join(", ")}.`
    );
  }

  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          apiKey: envStatus.config.apiKey,
          authDomain: envStatus.config.authDomain,
          projectId: envStatus.config.projectId,
          appId: envStatus.config.appId,
          messagingSenderId: envStatus.config.messagingSenderId,
          storageBucket: envStatus.config.storageBucket,
        });

  runtimeCache = {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
  };

  return runtimeCache;
}

export function getChatAuth(): Auth {
  return getFirebaseChatRuntime().auth;
}

export function getChatFirestore(): Firestore {
  return getFirebaseChatRuntime().db;
}
