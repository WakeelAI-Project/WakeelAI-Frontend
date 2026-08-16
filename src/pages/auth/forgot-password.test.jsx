// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => {
    const t = (key, options) => {
      const map = {
        "auth.forgotPasswordTitle": "Forgot password",
        "auth.forgotPasswordDescription":
          "Enter your email to receive a verification code.",
        "auth.email": "Email",
        "auth.sendCode": "Send code",
        "auth.sendingCode": "Sending...",
        "auth.backToLogin": "Back to login",
        "auth.invalidEmail": "Enter a valid email address",
        "auth.forgotPasswordSuccess":
          "If an account exists for this email, a verification code has been sent.",
        "auth.welcomeDesc":
          "Sign in as the company owner or an invited HR user.",
      };
      if (options?.defaultValue) return options.defaultValue;
      return map[key] || key;
    };
    return {
      t,
      i18n: { language: "en", changeLanguage: () => {} },
    };
  },
}));

vi.mock("../../hooks/use-locale", () => {
  return {
    useLocale: () => {
      const t = (key, options) => {
        const map = {
          "auth.forgotPasswordTitle": "Forgot password",
          "auth.forgotPasswordDescription":
            "Enter your email to receive a verification code.",
          "auth.email": "Email",
          "auth.sendCode": "Send code",
          "auth.sendingCode": "Sending...",
          "auth.backToLogin": "Back to login",
          "auth.invalidEmail": "Enter a valid email address",
          "auth.forgotPasswordSuccess":
            "If an account exists for this email, a verification code has been sent.",
          "auth.welcomeDesc":
            "Sign in as the company owner or an invited HR user.",
        };
        if (options?.defaultValue) return options.defaultValue;
        return map[key] || key;
      };
      return {
        t,
        isRtl: false,
        direction: "ltr",
        language: "en",
        changeLanguage: () => {},
      };
    },
  };
});

vi.mock("../../features/auth/services/auth-service", () => {
  const forgotPasswordMock = vi.fn();
  const resetPasswordMock = vi.fn();
  return {
    forgotPassword: forgotPasswordMock,
    resetPassword: resetPasswordMock,
  };
});

import { ForgotPasswordPage } from "./forgot-password";
import { forgotPassword } from "../../features/auth/services/auth-service";
import { ThemeProvider } from "../../components/providers/theme-provider";

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the forgot password form with title", async () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <ForgotPasswordPage />
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(screen.getByText("Forgot password")).toBeInTheDocument();
    expect(
      screen.getByText(/enter your email to receive a verification code/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send code/i }),
    ).toBeInTheDocument();
  });

  it("includes the back to login link", async () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <ForgotPasswordPage />
        </MemoryRouter>
      </ThemeProvider>,
    );

    const backLinks = screen.getAllByText("Back to login");
    const backLink = backLinks.find((link) =>
      link.closest("a")?.href.includes("/login"),
    );
    expect(backLink).toBeTruthy();
  });
});
