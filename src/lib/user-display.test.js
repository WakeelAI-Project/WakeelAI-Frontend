import { describe, expect, it } from "vitest";
import {
  getInitials,
  getUserFullName,
  getUserId,
  getUserInitials,
  normalizeDisplayName,
} from "./user-display";

describe("user-display", () => {
  it("normalizes display names without assuming a fixed word count", () => {
    expect(normalizeDisplayName("  Ahmed   Mohamed   Alaa  ")).toBe("Ahmed Mohamed Alaa");
    expect(getUserFullName({ full_name: " Mohamed   Hassan " })).toBe("Mohamed Hassan");
  });

  it("uses first and last non-empty name parts for initials", () => {
    expect(getInitials("Ahmed Alaa")).toBe("AA");
    expect(getInitials("Mohamed Hassan")).toBe("MH");
    expect(getInitials("Ahmed")).toBe("A");
    expect(getInitials("Ahmed Mohamed Alaa")).toBe("AA");
  });

  it("handles Arabic names and missing values gracefully", () => {
    expect(getInitials("  احمد   محمد   علاء  ")).toBe("اع");
    expect(getInitials(undefined, "?")).toBe("?");
    expect(getUserInitials(null, "?")).toBe("?");
  });

  it("reads common authenticated user identity fields", () => {
    expect(getUserId({ user_id: "u-1" })).toBe("u-1");
    expect(getUserId({ sub: "u-2" })).toBe("u-2");
    expect(getUserInitials({ name: "Ahmed Alaa" })).toBe("AA");
  });
});
