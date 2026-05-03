export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  messagingSenderId?: string;
  storageBucket?: string;
};

type FirebaseEnvStatus = {
  enabled: boolean;
  valid: boolean;
  missingKeys: string[];
  config: FirebaseClientConfig | null;
};

const REQUIRED_FIREBASE_KEYS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

function normalizeBoolean(value: string | boolean | undefined): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  return String(value ?? "")
    .trim()
    .toLowerCase() === "true";
}

export function isFirebaseChatEnabled(): boolean {
  return normalizeBoolean(import.meta.env.VITE_CHAT_FIREBASE_ENABLED);
}

export function getFirebaseEnvStatus(): FirebaseEnvStatus {
  const enabled = isFirebaseChatEnabled();
  if (!enabled) {
    return {
      enabled: false,
      valid: false,
      missingKeys: [],
      config: null,
    };
  }

  const envMap: Record<string, string | undefined> = {
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
    VITE_FIREBASE_MESSAGING_SENDER_ID:
      import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  };

  const missingKeys = REQUIRED_FIREBASE_KEYS.filter((key) => {
    const value = envMap[key];
    return !value || !String(value).trim();
  });

  if (missingKeys.length > 0) {
    return {
      enabled: true,
      valid: false,
      missingKeys,
      config: null,
    };
  }

  return {
    enabled: true,
    valid: true,
    missingKeys: [],
    config: {
      apiKey: String(envMap.VITE_FIREBASE_API_KEY),
      authDomain: String(envMap.VITE_FIREBASE_AUTH_DOMAIN),
      projectId: String(envMap.VITE_FIREBASE_PROJECT_ID),
      appId: String(envMap.VITE_FIREBASE_APP_ID),
      messagingSenderId: envMap.VITE_FIREBASE_MESSAGING_SENDER_ID,
      storageBucket: envMap.VITE_FIREBASE_STORAGE_BUCKET,
    },
  };
}
