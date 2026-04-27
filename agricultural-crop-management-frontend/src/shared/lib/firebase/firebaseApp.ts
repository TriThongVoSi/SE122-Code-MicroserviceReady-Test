import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
};

const requiredEnvEntries: Array<[string, string | undefined]> = [
  ["VITE_FIREBASE_API_KEY", firebaseConfig.apiKey],
  ["VITE_FIREBASE_AUTH_DOMAIN", firebaseConfig.authDomain],
  ["VITE_FIREBASE_PROJECT_ID", firebaseConfig.projectId],
  ["VITE_FIREBASE_APP_ID", firebaseConfig.appId],
];

export const firebaseMissingEnvKeys = requiredEnvEntries
  .filter(([, value]) => !value || !value.trim())
  .map(([key]) => key);

const firebaseEnabledByFlag =
  String(import.meta.env.VITE_CHAT_FIREBASE_ENABLED ?? "").trim().toLowerCase() === "true";

let firebaseInitError: string | null = null;
let app: FirebaseApp | null = null;

if (firebaseEnabledByFlag && firebaseMissingEnvKeys.length === 0) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  } catch (error) {
    firebaseInitError = error instanceof Error ? error.message : "Firebase initialization failed.";
    app = null;
  }
}

export const isFirebaseChatEnabled =
  firebaseEnabledByFlag && firebaseMissingEnvKeys.length === 0 && app !== null;

export function getFirebaseChatDisabledReason(): string {
  if (!firebaseEnabledByFlag) {
    return "Firebase chat is disabled by environment flag.";
  }
  if (firebaseMissingEnvKeys.length > 0) {
    return `Firebase chat configuration is incomplete: ${firebaseMissingEnvKeys.join(", ")}.`;
  }
  if (firebaseInitError) {
    return `Firebase chat failed to initialize: ${firebaseInitError}`;
  }
  return "Firebase chat is unavailable.";
}

export const firebaseAuth: Auth | null = app ? getAuth(app) : null;
export const firestoreDb: Firestore | null = app ? getFirestore(app) : null;
