// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../providers/theme-provider";
import { Topbar } from "./topbar";
import "../../i18n";

let mockCurrentUser = { role: "HR_Manager" };

vi.mock("../../features/auth/hooks/use-auth", () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
  }),
}));

function renderTopbar(props = {}) {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <Topbar
          activeId="dashboard"
          onMenuClick={vi.fn()}
          onLogout={vi.fn()}
          {...props}
        />
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe("Topbar", () => {
  beforeEach(() => {
    localStorage.clear();
    mockCurrentUser = { role: "HR_Manager" };
  });

  afterEach(() => {
    cleanup();
  });

  it("renders initials from the resolved authenticated user name", () => {
    renderTopbar({ userName: "  Ahmed   Mohamed   Alaa  " });

    expect(screen.getByText("AA")).toBeInTheDocument();
  });

  it("falls back to auth user name fields and supports Arabic names", () => {
    mockCurrentUser = { role: "HR_Manager", name: " احمد   محمد   علاء " };

    renderTopbar();

    expect(screen.getByText("اع")).toBeInTheDocument();
  });

  it("does not render the removed global search affordance", () => {
    renderTopbar({ userName: "Mohamed Hassan" });

    expect(screen.queryByText("Search employee, contract, or compliance...")).not.toBeInTheDocument();
    expect(screen.queryByText("Ctrl K")).not.toBeInTheDocument();
  });
});
