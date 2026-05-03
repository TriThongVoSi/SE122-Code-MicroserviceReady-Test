import { beforeEach, describe, expect, it, vi } from "vitest";

const appMocks = vi.hoisted(() => ({
  getApps: vi.fn(),
  initializeApp: vi.fn(),
}));

const authMocks = vi.hoisted(() => ({
  getAuth: vi.fn(),
}));

const firestoreMocks = vi.hoisted(() => ({
  getFirestore: vi.fn(),
}));

vi.mock("firebase/app", () => ({
  getApps: appMocks.getApps,
  initializeApp: appMocks.initializeApp,
}));

vi.mock("firebase/auth", () => ({
  getAuth: authMocks.getAuth,
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: firestoreMocks.getFirestore,
}));

describe("shared/lib/firebase/firebaseApp", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.clearAllMocks();

    appMocks.getApps.mockReturnValue([]);
    appMocks.initializeApp.mockReturnValue({ kind: "app" });
    authMocks.getAuth.mockReturnValue({ kind: "auth" });
    firestoreMocks.getFirestore.mockReturnValue({ kind: "db" });
  });

  it("initializes firebase app/auth/firestore when env is complete", async () => {
    vi.stubEnv("VITE_CHAT_FIREBASE_ENABLED", "true");
    vi.stubEnv("VITE_FIREBASE_API_KEY", "k");
    vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "x.firebaseapp.com");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "project-id");
    vi.stubEnv("VITE_FIREBASE_APP_ID", "app-id");

    const module = await import("./firebaseApp");

    expect(module.isFirebaseChatEnabled).toBe(true);
    expect(appMocks.initializeApp).toHaveBeenCalledTimes(1);
    expect(authMocks.getAuth).toHaveBeenCalledTimes(1);
    expect(firestoreMocks.getFirestore).toHaveBeenCalledTimes(1);
    expect(module.firebaseAuth).not.toBeNull();
    expect(module.firestoreDb).not.toBeNull();
  });

  it("keeps chat disabled when required env is missing", async () => {
    vi.stubEnv("VITE_CHAT_FIREBASE_ENABLED", "true");
    vi.stubEnv("VITE_FIREBASE_API_KEY", "");
    vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "");
    vi.stubEnv("VITE_FIREBASE_APP_ID", "");

    const module = await import("./firebaseApp");

    expect(module.isFirebaseChatEnabled).toBe(false);
    expect(module.firebaseMissingEnvKeys.length).toBeGreaterThan(0);
    expect(appMocks.initializeApp).not.toHaveBeenCalled();
    expect(module.firebaseAuth).toBeNull();
    expect(module.firestoreDb).toBeNull();
  });
});
