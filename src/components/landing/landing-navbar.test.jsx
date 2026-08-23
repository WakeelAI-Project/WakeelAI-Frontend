// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "../providers/theme-provider";
import { LandingNavbar } from "./landing-navbar";
import "../../i18n";

describe("LandingNavbar Theme Toggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the theme toggle button and switches between light and dark modes", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <LandingNavbar />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Initial theme defaults to light
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    // Find the desktop theme toggle button
    const toggleButtons = screen.getAllByRole("button", { name: /toggle theme/i });
    expect(toggleButtons.length).toBeGreaterThan(0);

    const desktopToggle = toggleButtons[0];

    // Click to switch to dark mode
    fireEvent.click(desktopToggle);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("wakeel-theme")).toBe("dark");

    // Click again to switch back to light mode
    fireEvent.click(desktopToggle);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("wakeel-theme")).toBe("light");
  });

  it("initializes with persisted theme from localStorage", () => {
    localStorage.setItem("wakeel-theme", "dark");

    render(
      <MemoryRouter>
        <ThemeProvider>
          <LandingNavbar />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("renders theme toggle in mobile menu and switches theme", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <LandingNavbar />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Open mobile menu
    const menuToggle = screen.getByRole("button", { name: /open navigation menu/i });
    fireEvent.click(menuToggle);

    // Find all theme toggle buttons (desktop + mobile)
    const toggleButtons = screen.getAllByRole("button", { name: /toggle theme/i });
    expect(toggleButtons.length).toBe(2);

    const mobileToggle = toggleButtons[1];
    fireEvent.click(mobileToggle);

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("wakeel-theme")).toBe("dark");
  });
});
