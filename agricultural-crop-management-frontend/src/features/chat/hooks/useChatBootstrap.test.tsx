import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useChatBootstrap } from "./useChatBootstrap";

const authMocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

const firebaseRuntimeMocks = vi.hoisted(() => ({
  isFirebaseChatEnabled: true,
  firebaseAuth: { currentUser: null } as { currentUser: { uid: string } | null } | null,
  getFirebaseChatDisabledReason: vi.fn(),
}));

const tokenApiMocks = vi.hoisted(() => ({
  requestFirebaseChatToken: vi.fn(),
}));

const authSdkMocks = vi.hoisted(() => ({
  signInWithCustomToken: vi.fn(),
}));

vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: authMocks.useAuth,
}));

vi.mock("@/shared/lib/firebase/firebaseApp", () => ({
  get isFirebaseChatEnabled() {
    return firebaseRuntimeMocks.isFirebaseChatEnabled;
  },
  get firebaseAuth() {
    return firebaseRuntimeMocks.firebaseAuth;
  },
  getFirebaseChatDisabledReason: firebaseRuntimeMocks.getFirebaseChatDisabledReason,
}));

vi.mock("../api/firebaseChatTokenApi", () => ({
  requestFirebaseChatToken: tokenApiMocks.requestFirebaseChatToken,
}));

vi.mock("firebase/auth", () => ({
  signInWithCustomToken: authSdkMocks.signInWithCustomToken,
}));

describe("useChatBootstrap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firebaseRuntimeMocks.isFirebaseChatEnabled = true;
    firebaseRuntimeMocks.firebaseAuth = { currentUser: null };
    firebaseRuntimeMocks.getFirebaseChatDisabledReason.mockReturnValue(
      "Firebase chat is disabled."
    );

    authMocks.useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 24, role: "farmer" },
    });
  });

  it("returns disabled state when firebase chat runtime is disabled", async () => {
    firebaseRuntimeMocks.isFirebaseChatEnabled = false;
    firebaseRuntimeMocks.firebaseAuth = null;

    const { result } = renderHook(() => useChatBootstrap());

    await waitFor(() => {
      expect(result.current.status).toBe("disabled");
      expect(result.current.appUid).toBeNull();
    });

    expect(result.current.error).toContain("disabled");
    expect(tokenApiMocks.requestFirebaseChatToken).not.toHaveBeenCalled();
  });

  it("requests token bridge and signs in with custom token", async () => {
    tokenApiMocks.requestFirebaseChatToken.mockResolvedValue({
      appUid: "u_24",
      role: "FARMER",
      customToken: "custom-token-24",
    });

    authSdkMocks.signInWithCustomToken.mockResolvedValue({
      user: { uid: "u_24" },
    });

    const { result } = renderHook(() => useChatBootstrap());

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    expect(tokenApiMocks.requestFirebaseChatToken).toHaveBeenCalledTimes(1);
    expect(authSdkMocks.signInWithCustomToken).toHaveBeenCalledWith(
      firebaseRuntimeMocks.firebaseAuth,
      "custom-token-24"
    );
    expect(result.current.appUid).toBe("u_24");
  });

  it("returns error state when token bridge fails", async () => {
    tokenApiMocks.requestFirebaseChatToken.mockRejectedValue(
      new Error("Bridge failed")
    );

    const { result } = renderHook(() => useChatBootstrap());

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    expect(result.current.error).toContain("Bridge failed");
  });
});
