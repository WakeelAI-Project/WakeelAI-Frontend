/**
 * Date and time formatting utilities for Wakeel AI Frontend.
 *
 * Ensures UTC timestamps returned by the backend are correctly parsed as UTC
 * and rendered in the browser's local timezone, while protecting date-only
 * calendar fields (e.g. "2026-08-26") from timezone boundary shifts.
 */

/**
 * Parses a backend timestamp ensuring UTC semantics.
 * If an ISO string has a time component ('T') but lacks a timezone indicator,
 * 'Z' is appended so standard JS Date parsers interpret it as UTC.
 *
 * @param {string|Date|number|null|undefined} value
 * @returns {Date|null}
 */
export function parseUtcDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === "string") {
    let str = value.trim();
    if (!str) return null;

    // If it is an ISO date-time string without a timezone offset or 'Z', treat as UTC
    if (
      str.includes("T") &&
      !str.endsWith("Z") &&
      !str.endsWith("z") &&
      !/[+-]\d{2}(?::?\d{2})?$/.test(str)
    ) {
      str += "Z";
    }

    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

/**
 * Formats a date-time timestamp in the user's local timezone.
 *
 * Example:
 *   "2026-08-24T12:02:00Z" in UTC+3 (Egypt) -> "Aug 24, 2026, 3:02 PM"
 *
 * @param {string|Date|number|null|undefined} value - UTC ISO timestamp
 * @param {string} [locale="en-US"] - e.g. "en-US" or "ar-EG"
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string} Localized date-time string or "-" if invalid
 */
export function formatLocalDateTime(value, locale = "en-US", options = {}) {
  const date = parseUtcDate(value);
  if (!date) return "-";

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...options,
  };

  return date.toLocaleDateString(locale, defaultOptions);
}

/**
 * Formats a date-only string (e.g. "2026-08-26") without shifting the calendar day
 * across timezone boundaries.
 *
 * @param {string|Date|number|null|undefined} value - e.g. "2026-08-26"
 * @param {string} [locale="en-US"] - e.g. "en-US" or "ar-EG"
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string} Localized date string or "-" if invalid
 */
export function formatLocalDateOnly(value, locale = "en-US", options = {}) {
  if (!value) return "-";

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  if (typeof value === "string") {
    const trimmed = value.trim();
    // Check if format is pure calendar date "YYYY-MM-DD"
    const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      // Create date at noon in local time to prevent day shifting across any timezone
      const localDate = new Date(year, month, day, 12, 0, 0);
      return localDate.toLocaleDateString(locale, defaultOptions);
    }
  }

  const date = parseUtcDate(value);
  if (!date) return "-";
  return date.toLocaleDateString(locale, defaultOptions);
}
