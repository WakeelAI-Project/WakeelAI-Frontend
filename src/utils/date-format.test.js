// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  formatLocalDateOnly,
  formatLocalDateTime,
  parseUtcDate,
} from "./date-format";

describe("date-format utilities", () => {
  describe("parseUtcDate", () => {
    it("parses ISO timestamp ending with Z as UTC", () => {
      const date = parseUtcDate("2026-08-24T12:02:00Z");
      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString()).toBe("2026-08-24T12:02:00.000Z");
    });

    it("parses ISO timestamp without Z suffix as UTC", () => {
      const date = parseUtcDate("2026-08-24T12:02:00");
      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString()).toBe("2026-08-24T12:02:00.000Z");
    });

    it("returns null for null, undefined, or empty strings", () => {
      expect(parseUtcDate(null)).toBeNull();
      expect(parseUtcDate(undefined)).toBeNull();
      expect(parseUtcDate("")).toBeNull();
      expect(parseUtcDate("   ")).toBeNull();
    });
  });

  describe("formatLocalDateTime", () => {
    it("converts UTC timestamp to Africa/Cairo (UTC+3) correctly", () => {
      const formatted = formatLocalDateTime(
        "2026-08-24T12:02:00Z",
        "en-US",
        { timeZone: "Africa/Cairo" }
      );
      expect(formatted).toBe("Aug 24, 2026, 3:02 PM");
    });

    it("converts UTC timestamp without Z suffix to Africa/Cairo (UTC+3) correctly", () => {
      const formatted = formatLocalDateTime(
        "2026-08-24T12:02:00",
        "en-US",
        { timeZone: "Africa/Cairo" }
      );
      expect(formatted).toBe("Aug 24, 2026, 3:02 PM");
    });

    it("converts UTC timestamp to UTC correctly", () => {
      const formatted = formatLocalDateTime(
        "2026-08-24T12:02:00Z",
        "en-US",
        { timeZone: "UTC" }
      );
      expect(formatted).toBe("Aug 24, 2026, 12:02 PM");
    });

    it("converts UTC timestamp to America/New_York (UTC-4 in August EDT)", () => {
      const formatted = formatLocalDateTime(
        "2026-08-24T12:02:00Z",
        "en-US",
        { timeZone: "America/New_York" }
      );
      expect(formatted).toBe("Aug 24, 2026, 8:02 AM");
    });

    it("returns '-' for missing timestamp", () => {
      expect(formatLocalDateTime(null)).toBe("-");
      expect(formatLocalDateTime(undefined)).toBe("-");
    });
  });

  describe("formatLocalDateOnly", () => {
    it("formats calendar date string without shifting day in UTC-5 (America/New_York)", () => {
      const formatted = formatLocalDateOnly("2026-08-26", "en-US");
      expect(formatted).toBe("Aug 26, 2026");
    });

    it("formats calendar date string in Arabic locale without shifting day", () => {
      const formatted = formatLocalDateOnly("2026-08-26", "ar-EG");
      expect(formatted).toContain("٢٠٢٦");
    });

    it("returns '-' for missing date", () => {
      expect(formatLocalDateOnly(null)).toBe("-");
      expect(formatLocalDateOnly(undefined)).toBe("-");
    });
  });
});
