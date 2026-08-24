// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "../components/ui/toast";
import "../i18n";

const { pendingRow } = vi.hoisted(() => ({
  pendingRow: {
    request_id: "req-1",
    employee_id: "emp-1",
    employee_name: "Nour Hassan",
    leave_type: "Annual",
    start_date: "2026-03-01",
    end_date: "2026-03-03",
    days_requested: 3,
    status: "Pending",
    submitted_at: "2026-02-20T10:00:00Z",
  },
}));

vi.mock("../features/company/services/leave-service", () => ({
  getLeaveRequests: vi.fn().mockResolvedValue({ data: [pendingRow], page: 1, total: 1 }),
  updateLeaveRequest: vi.fn(),
}));

import { LeavePage } from "./leave";

// FIX-14: Company_Owner gets the same leave list as HR, read-only - no
// Approve/Reject controls anywhere in the UI, even though the API call
// (getLeaveRequests) is identical.
describe("LeavePage readOnly mode", () => {
  afterEach(() => cleanup());

  it("hides Approve/Reject actions on a Pending row when readOnly", async () => {
    render(
      <ToastProvider>
        <LeavePage readOnly />
      </ToastProvider>
    );

    await waitFor(() => expect(screen.getByText("Nour Hassan")).toBeInTheDocument());

    expect(screen.queryByRole("button", { name: /approve/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /reject/i })).not.toBeInTheDocument();
  });

  it("shows Approve/Reject actions on a Pending row in the normal (HR) mode", async () => {
    render(
      <ToastProvider>
        <LeavePage />
      </ToastProvider>
    );

    await waitFor(() => expect(screen.getByText("Nour Hassan")).toBeInTheDocument());

    expect(screen.getByRole("button", { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reject/i })).toBeInTheDocument();
  });
});
