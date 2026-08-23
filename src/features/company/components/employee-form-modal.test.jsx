// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import "../../../i18n";

let mockCurrentUser = null;
vi.mock("../../auth/hooks/use-auth", () => ({
  useAuth: () => ({ currentUser: mockCurrentUser }),
}));

import { EmployeeFormModal } from "./employee-form-modal";

// FIX-13: departments are Company_Owner-only, so a fresh company's HR account
// used to hit an unsubmittable form with no explanation. This must show a
// clear empty state instead, never widen who can create a department.
describe("EmployeeFormModal - no departments yet", () => {
  afterEach(() => {
    cleanup();
    mockCurrentUser = null;
  });

  function renderModal({ role, departments = [] }) {
    mockCurrentUser = { role };
    return render(
      <MemoryRouter>
        <EmployeeFormModal open mode="create" departments={departments} onOpenChange={() => {}} />
      </MemoryRouter>
    );
  }

  it("shows the HR explanation with no link to Departments when the caller is HR_Manager", () => {
    renderModal({ role: "HR_Manager" });

    expect(screen.getByText(/no departments yet/i)).toBeInTheDocument();
    expect(screen.getByText(/ask the company owner/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /go to departments/i })).not.toBeInTheDocument();
    // The real form fields must not render - nothing to submit against.
    expect(screen.queryByRole("textbox", { name: "" })).not.toBeInTheDocument();
    expect(screen.queryByText("Full name")).not.toBeInTheDocument();
  });

  it("shows a direct link to Departments when the caller is Company_Owner", () => {
    renderModal({ role: "Company_Owner" });

    expect(screen.getByText(/no departments yet/i)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /go to departments/i });
    expect(link).toHaveAttribute("href", "/owner/departments");
  });

  it("renders the normal form once at least one department exists", () => {
    renderModal({ role: "HR_Manager", departments: [{ id: "d1", name: "Engineering" }] });

    expect(screen.queryByText(/no departments yet/i)).not.toBeInTheDocument();
    expect(screen.getByText("Full name")).toBeInTheDocument();
  });
});
