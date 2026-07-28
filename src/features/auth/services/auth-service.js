
import api from "../../../lib/api";

// ---------------------------------------------------------------------------
// Dev mock configuration
// ---------------------------------------------------------------------------

// Temporary dev mock until /api/auth/* is connected.
export const MOCK_AUTH_ENABLED = import.meta.env.DEV;
const MOCK_REGISTERED_ACCOUNTS_KEY = "wakeel-dev-registered-accounts";

const MOCK_ACCOUNTS = {
  "owner@wakeel.ai": {
    password: "Owner@123",
    user: {
      sub: "dev-owner-001",
      companyId: "dev-company-001",
      role: "Owner",
      name: "Mariam Hassan",
      nameEn: "Mariam Hassan",
      initials: "MH",
    },
  },
  "hr@wakeel.ai": {
    password: "Hr@123",
    user: {
      sub: "dev-hr-001",
      companyId: "dev-company-001",
      role: "HR",
      name: "Nour Ali",
      nameEn: "Nour Ali",
      initials: "NA",
    },
  },
  "mohamedtarek@gmail.com": {
    password: "Ahmed@1234",
    user: {
      sub: "dev-hr-002",
      companyId: "dev-company-001",
      role: "HR",
      name: "Mohamed Tarek",
      nameEn: "Mohamed Tarek",
      initials: "MT",
    },
  },
};

// ---------------------------------------------------------------------------
// Internal mock helpers (not exported)
// ---------------------------------------------------------------------------

const wait = (milliseconds) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

function encodeJwtPart(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function createMockToken(payload) {
  return `${encodeJwtPart({ alg: "none", typ: "JWT" })}.${encodeJwtPart(payload)}.dev`;
}

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function canUseMock(error) {
  const status = error?.response?.status;
  return MOCK_AUTH_ENABLED && (!error?.response || status === 404 || status === 405);
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function createInitials(name) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "OW";
}

function createMockId(prefix) {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function readRegisteredAccounts() {
  try {
    return JSON.parse(window.localStorage.getItem(MOCK_REGISTERED_ACCOUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeRegisteredAccounts(accounts) {
  window.localStorage.setItem(MOCK_REGISTERED_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function getMockAccounts() {
  return {
    ...MOCK_ACCOUNTS,
    ...readRegisteredAccounts(),
  };
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Normalizes any backend auth response into a single canonical shape.
 *
 * Every login / register / refresh response goes through this function so
 * the rest of the app always works with consistent field names regardless
 * of which endpoint produced the response.
 *
 * @param {object} raw - Raw response data from the backend
 * @returns {{ token: string, refreshToken: string|null, expiresIn: number|null, companyId: string|null, userId: string|null, role: string|null }}
 */
export function normalizeAuthResponse(raw) {
  if (!raw) return { token: null, refreshToken: null, expiresIn: null, companyId: null, userId: null, role: null };

  return {
    token: raw.access_token ?? raw.token ?? null,
    refreshToken: raw.refresh_token ?? null,
    expiresIn: raw.expires_in ?? null,
    companyId: raw.company_id ?? null,
    userId: raw.user_id ?? null,
    role: raw.role ?? null,
  };
}

// ---------------------------------------------------------------------------
// Auth service functions
// ---------------------------------------------------------------------------

/**
 * Sends a login request to the backend.
 * Works for both HR employees and Company Owners.
 *
 * Returns raw backend response. Callers should use normalizeAuthResponse().
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} Raw backend response
 */
export async function login(email, password) {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    if (!canUseMock(error)) throw error;

    await wait(300);
    const account = getMockAccounts()[normalizeEmail(email)];
    if (!account || account.password !== password) {
      throw createError("Invalid email or password", 401);
    }

    // Mock now returns the real backend field names so normalizeAuthResponse() works uniformly
    const tokenPayload = {
      ...account.user,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900,
    };
    const access_token = createMockToken(tokenPayload);
    const refresh_token = createMockToken({ sub: account.user.sub, type: "refresh" });

    return {
      user_id: account.user.sub,
      company_id: account.user.companyId,
      role: account.user.role,
      access_token,
      refresh_token,
      expires_in: 900,
    };
  }
}

/**
 * Creates a company and owner account.
 *
 * @deprecated Use registerCompany() — this function uses legacy field names.
 *   Kept for backwards compatibility only.
 */
export async function register({ ownerName, companyName, email, password }) {
  try {
    const response = await api.post("/auth/register-company", {
      ownerName,
      companyName,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    if (!canUseMock(error)) throw error;

    await wait(400);
    const normalizedEmail = normalizeEmail(email);
    const accounts = getMockAccounts();

    if (accounts[normalizedEmail]) {
      throw createError("An account with this email already exists", 409);
    }

    const companyId = createMockId("dev-company");
    const userId = createMockId("dev-owner");
    const registeredAccounts = readRegisteredAccounts();

    registeredAccounts[normalizedEmail] = {
      password,
      user: {
        sub: userId,
        companyId,
        role: "Owner",
        name: ownerName,
        nameEn: ownerName,
        initials: createInitials(ownerName),
        companyName,
      },
    };
    writeRegisteredAccounts(registeredAccounts);

    return { companyId, userId };
  }
}

/**
 * Registers a new company and its owner via POST /auth/register-company.
 *
 * Unlike a typical registration flow, the backend immediately authenticates the
 * owner and returns a valid access_token. Callers should pass the returned
 * access_token directly to setToken() from the Zustand auth store.
 *
 * @param {{ company_name: string, tax_id: string, owner_full_name: string, owner_email: string, password: string }} data
 * @returns {Promise<object>} Raw backend response (use normalizeAuthResponse() on result)
 */
export async function registerCompany(data) {
  try {
    const response = await api.post("/auth/register-company", {
      company_name: data.company_name,
      tax_id: data.tax_id,
      owner_full_name: data.owner_full_name,
      owner_email: data.owner_email,
      password: data.password,
    });
    return response.data;
  } catch (error) {
    if (!canUseMock(error)) throw error;

    // Dev mock: simulate the backend response including a real-looking JWT
    await wait(400);

    const normalizedEmail = normalizeEmail(data.owner_email);
    const accounts = getMockAccounts();

    if (accounts[normalizedEmail]) {
      throw createError("An account with this email already exists", 409);
    }

    const companyId = createMockId("dev-company");
    const userId = createMockId("dev-owner");
    const initials = createInitials(data.owner_full_name);

    // Persist the account so the owner can also use the login page in dev
    const registeredAccounts = readRegisteredAccounts();
    registeredAccounts[normalizedEmail] = {
      password: data.password,
      user: {
        sub: userId,
        companyId,
        role: "Company_Owner",
        name: data.owner_full_name,
        nameEn: data.owner_full_name,
        initials,
        companyName: data.company_name,
      },
    };
    writeRegisteredAccounts(registeredAccounts);

    // Build a mock JWT payload that matches what the real backend would issue
    const tokenPayload = {
      sub: userId,
      companyId,
      role: "Company_Owner",
      name: data.owner_full_name,
      nameEn: data.owner_full_name,
      initials,
      companyName: data.company_name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900,
    };

    const access_token = createMockToken(tokenPayload);
    const refresh_token = createMockToken({ sub: userId, type: "refresh" });

    return {
      company_id: companyId,
      user_id: userId,
      role: "Company_Owner",
      access_token,
      refresh_token,
      expires_in: 900,
    };
  }
}

/**
 * Exchanges a refresh token for a new access token via POST /auth/refresh.
 *
 * Returns raw backend response — callers use normalizeAuthResponse() on it.
 * Throws if the refresh token is invalid or the network request fails AND
 * the mock cannot handle it (i.e., real backend returned a non-404/405 error).
 *
 * @param {string} refreshToken
 * @returns {Promise<object>} Raw backend response: { access_token, expires_in }
 */
export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) throw createError("No refresh token available", 401);

  try {
    const response = await api.post("/auth/refresh", { refresh_token: refreshToken });
    return response.data;
  } catch (error) {
    if (!canUseMock(error)) throw error;

    await wait(200);

    // In mock mode, any refresh_token that looks like a mock token is accepted.
    // We decode it minimally — the payload is the second segment.
    try {
      const parts = refreshToken.split(".");
      if (parts.length !== 3) throw new Error("Invalid mock token", { cause: error });

      // Re-issue a fresh access token for the same sub
      const payloadStr = atob(parts[1].replaceAll("-", "+").replaceAll("_", "/"));
      const payload = JSON.parse(payloadStr);
      const sub = payload.sub;

      // Find the user in mock accounts by sub
      const allAccounts = getMockAccounts();
      const account = Object.values(allAccounts).find((a) => a.user?.sub === sub);
      if (!account) throw createError("Refresh token invalid", 401);

      const tokenPayload = {
        ...account.user,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 900,
      };
      const access_token = createMockToken(tokenPayload);

      return { access_token, expires_in: 900 };
    } catch {
      throw createError("Refresh token invalid or expired", 401);
    }
  }
}

/**
 * Calls POST /auth/logout with the current Authorization header.
 *
 * Always resolves — never throws. Network failures are silently swallowed
 * because logout must always clear local state regardless of backend response.
 *
 * @returns {Promise<void>}
 */
export async function logoutApi() {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    if (!canUseMock(error)) {
      // Swallow network / backend errors — logout must always succeed locally
      console.warn("[auth] Logout request failed (ignored):", error?.message);
    }
    // In mock mode, just a no-op
    if (MOCK_AUTH_ENABLED) await wait(100);
  }
}

