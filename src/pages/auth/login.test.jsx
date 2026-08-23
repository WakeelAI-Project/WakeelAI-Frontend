// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const T_MAP = {
  "auth.welcomeBack": "Welcome back",
  "auth.welcomeDesc": "Sign in as the company owner or an invited HR user.",
  "auth.signInAs": "Sign in as",
  "auth.companyOwner": "Company Owner",
  "auth.hrUser": "HR User",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.signIn": "Sign in",
  "auth.signingIn": "Signing in...",
  "auth.forgotPassword": "Forgot password?",
  "auth.newOwner": "New company owner?",
  "auth.createAccount": "Create account",
  "auth.loginFailed": "Unable to log in. Please try again.",
  "auth.roleMismatch":
    "This account does not match the selected user type. Check the selection and try again.",
  "auth.employeeMobileOnly":
    "This account is for the employee mobile app. Please use the Wakeel mobile app to sign in.",
  "validation.required": "This field is required",
  "validation.invalidEmail": "Enter a valid email address",
};

const translate = (key, options) => {
  if (T_MAP[key]) return T_MAP[key];
  if (options?.defaultValue) return options.defaultValue;
  return key;
};

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: translate,
    i18n: { language: "en", changeLanguage: () => {} },
  }),
}));

vi.mock("../../hooks/use-locale", () => ({
  useLocale: () => ({
    t: translate,
    isRtl: false,
    direction: "ltr",
    language: "en",
    changeLanguage: () => {},
  }),
}));

const navigateMock = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => navigateMock };
});

const loginWithoutCommitMock = vi.fn();
const commitSessionMock = vi.fn();
const clearAuthMock = vi.fn();

vi.mock("../../features/auth/hooks/use-auth", () => ({
  useAuth: () => ({
    loginWithoutCommit: loginWithoutCommitMock,
    commitSession: commitSessionMock,
    clearAuth: clearAuthMock,
    currentUser: null,
    isAuthenticated: false,
  }),
}));

import { LoginPage } from "./login";
import { ThemeProvider } from "../../components/providers/theme-provider";

/** Builds a token whose payload jwt-decode can read. */
function makeToken(payload) {
  const b64 = (obj) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64(payload)}.sig`;
}

function renderLogin() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

async function submitCredentials(container, { role }) {
  fireEvent.click(screen.getByRole("button", { name: role }));
  fireEvent.change(container.querySelector('input[type="email"]'), {
    target: { value: "user@example.com" },
  });
  fireEvent.change(container.querySelector('input[type="password"]'), {
    target: { value: "Passw0rd!" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
}

describe("LoginPage role gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // RTL auto-cleanup only registers when Vitest `globals` are enabled, which
  // this project does not use — unmount explicitly so renders don't stack up.
  afterEach(() => {
    cleanup();
  });

  it("refuses an Employee token, keeps no session, and shows the mobile-app message", async () => {
    loginWithoutCommitMock.mockResolvedValue({
      token: makeToken({ role: "Employee", user_id: "e-1", company_id: "c-1" }),
      refreshToken: "r",
      expiresIn: 3600,
      mustChangePassword: false,
    });

    const { container } = renderLogin();
    await submitCredentials(container, { role: "HR User" });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      T_MAP["auth.employeeMobileOnly"],
    );
    expect(commitSessionMock).not.toHaveBeenCalled();
    expect(clearAuthMock).toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("refuses an HR token when Owner is selected and creates no session", async () => {
    loginWithoutCommitMock.mockResolvedValue({
      token: makeToken({ role: "HR_Manager", user_id: "h-1", company_id: "c-1" }),
      refreshToken: "r",
      expiresIn: 3600,
      mustChangePassword: false,
    });

    const { container } = renderLogin();
    await submitCredentials(container, { role: "Company Owner" });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      T_MAP["auth.roleMismatch"],
    );
    expect(commitSessionMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("commits the session and routes an HR user to the HR dashboard", async () => {
    loginWithoutCommitMock.mockResolvedValue({
      token: makeToken({ role: "HR_Manager", user_id: "h-1", company_id: "c-1" }),
      refreshToken: "r",
      expiresIn: 3600,
      mustChangePassword: false,
    });

    const { container } = renderLogin();
    await submitCredentials(container, { role: "HR User" });

    await waitFor(() => expect(commitSessionMock).toHaveBeenCalledTimes(1));
    expect(navigateMock).toHaveBeenCalledWith("/hr/dashboard", { replace: true });
  });

  it("commits the session and routes a Company_Owner to the owner dashboard", async () => {
    loginWithoutCommitMock.mockResolvedValue({
      token: makeToken({ role: "Company_Owner", user_id: "o-1", company_id: "c-1" }),
      refreshToken: "r",
      expiresIn: 3600,
      mustChangePassword: false,
    });

    const { container } = renderLogin();
    await submitCredentials(container, { role: "Company Owner" });

    await waitFor(() => expect(commitSessionMock).toHaveBeenCalledTimes(1));
    expect(navigateMock).toHaveBeenCalledWith("/owner/dashboard", {
      replace: true,
    });
  });
});
