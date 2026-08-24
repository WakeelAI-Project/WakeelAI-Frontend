import { beforeEach, describe, expect, it, vi } from "vitest";

const { refreshAccessTokenMock, cookieJar } = vi.hoisted(() => ({
  refreshAccessTokenMock: vi.fn(),
  cookieJar: { access: undefined, refresh: undefined, user: null },
}));

vi.mock("../services/auth-service", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    login: vi.fn(),
    logoutApi: vi.fn(),
    refreshAccessToken: refreshAccessTokenMock,
  };
});

vi.mock("../../../lib/api", () => ({
  setAuthToken: vi.fn(),
}));

vi.mock("../../../lib/cookies", () => ({
  getAccessTokenCookie: () => cookieJar.access,
  getRefreshTokenCookie: () => cookieJar.refresh,
  getUserCookie: () => cookieJar.user,
  setAccessTokenCookie: (t) => {
    cookieJar.access = t;
  },
  setRefreshTokenCookie: (t) => {
    cookieJar.refresh = t;
  },
  setUserCookie: (u) => {
    cookieJar.user = u;
  },
  removeAllAuthCookies: () => {
    cookieJar.access = undefined;
    cookieJar.refresh = undefined;
    cookieJar.user = null;
  },
}));

import { useAuthStore } from "./auth-store";

/** Builds a token whose payload jwt-decode can read. */
function makeToken(payload) {
  const b64 = (obj) =>
    globalThis
      .btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64(payload)}.sig`;
}

const HR_TOKEN = makeToken({
  role: "HR_Manager",
  user_id: "h-1",
  company_id: "c-1",
  exp: Math.floor(Date.now() / 1000) + 3600,
});

describe("auth-store mustChangePassword persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieJar.access = undefined;
    cookieJar.refresh = undefined;
    cookieJar.user = null;
    useAuthStore.setState({
      token: null,
      refreshToken: null,
      currentUser: null,
      isAuthenticated: false,
      mustChangePassword: false,
    });
  });

  it("preserves mustChangePassword when setToken is called without the flag", () => {
    const { setToken } = useAuthStore.getState();

    setToken(HR_TOKEN, "r-1", 3600, true);
    expect(useAuthStore.getState().mustChangePassword).toBe(true);

    // Silent refresh path: only token + refresh token are known.
    setToken(makeToken({ role: "HR_Manager", exp: 9999999999 }), "r-2");
    expect(useAuthStore.getState().mustChangePassword).toBe(true);
    expect(cookieJar.user.mustChangePassword).toBe(true);
  });

  it("keeps mustChangePassword across a bootstrap refresh that omits the flag", async () => {
    cookieJar.refresh = "r-1";
    cookieJar.user = { role: "HR_Manager", mustChangePassword: true };

    refreshAccessTokenMock.mockResolvedValue({
      access_token: HR_TOKEN,
      expires_in: 3600,
    });

    await useAuthStore.getState().bootstrapAuth();

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().mustChangePassword).toBe(true);
  });

  it("honours an explicit false from a refresh response", async () => {
    cookieJar.refresh = "r-1";
    cookieJar.user = { role: "HR_Manager", mustChangePassword: true };

    refreshAccessTokenMock.mockResolvedValue({
      access_token: HR_TOKEN,
      expires_in: 3600,
      must_change_password: false,
    });

    await useAuthStore.getState().bootstrapAuth();

    expect(useAuthStore.getState().mustChangePassword).toBe(false);
  });

  it("setMustChangePassword mirrors the flag into the user cookie", () => {
    const state = useAuthStore.getState();
    state.setToken(HR_TOKEN, "r-1", 3600, false);
    useAuthStore.getState().setMustChangePassword(true);

    expect(useAuthStore.getState().mustChangePassword).toBe(true);
    expect(cookieJar.user.mustChangePassword).toBe(true);
  });
});
