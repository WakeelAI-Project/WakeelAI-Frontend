import api from "../../../lib/api";

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

/**
 * Sends a login request to the backend.
 * Works for both HR employees and Company Owners.
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{token: string}>} Response containing the JWT token
 */
export async function login(email, password) {
  try {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  } catch (error) {
    if (!canUseMock(error)) throw error;

    await wait(300);
    const account = getMockAccounts()[normalizeEmail(email)];
    if (!account || account.password !== password) {
      throw createError("Invalid email or password", 401);
    }

    return { token: createMockToken(account.user) };
  }
}

/**
 * Creates a company and owner account. In dev, the mock stores the account so
 * the freshly registered owner can log in while the backend is unavailable.
 */
export async function register({ ownerName, companyName, email, password }) {
  try {
    const response = await api.post("/api/auth/register", {
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
