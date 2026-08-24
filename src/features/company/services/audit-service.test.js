import { describe, expect, it, vi } from "vitest";
import api from "../../../lib/api";
import { getAuditEvents } from "./audit-service";

vi.mock("../../../lib/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("audit-service", () => {
  it("calls the real AuditLogs endpoint and normalizes backend fields", async () => {
    api.get.mockResolvedValue({
      data: {
        data: [
          {
            id: "11111111-1111-1111-1111-111111111111",
            action: "TemplateCreated",
            details: "Created a contract template",
            user_id: "22222222-2222-2222-2222-222222222222",
            user_name: "John Doe",
            created_at: "2026-08-15T10:30:00Z",
            resource_type: "Template",
            resource_id: "33333333-3333-3333-3333-333333333333",
          },
        ],
        page: 1,
        limit: 20,
        total: 1,
      },
    });

    const result = await getAuditEvents({
      page: 1,
      limit: 20,
      action: "TemplateCreated",
    });

    expect(api.get).toHaveBeenCalledWith("/AuditLogs", {
      params: {
        action: "TemplateCreated",
        page: 1,
        limit: 20,
      },
    });

    expect(result).toMatchObject({
      data: [
        expect.objectContaining({
          action: "TemplateCreated",
          details: "Created a contract template",
          userId: "22222222-2222-2222-2222-222222222222",
          userName: "John Doe",
          userIdDisplay: "John Doe",
          createdAt: "2026-08-15T10:30:00Z",
          resourceType: "Template",
          resourceId: "33333333-3333-3333-3333-333333333333",
        }),
      ],
      page: 1,
      total: 1,
    });
  });
});
