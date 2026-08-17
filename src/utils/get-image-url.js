import { API_BASE_URL } from "../lib/config.js";

export function getImageUrl(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  if (
    trimmedValue.startsWith("http://") ||
    trimmedValue.startsWith("https://") ||
    trimmedValue.startsWith("blob:")
  ) {
    return trimmedValue;
  }

  if (!API_BASE_URL) {
    return trimmedValue;
  }

  return trimmedValue.startsWith("/")
    ? `${API_BASE_URL}${trimmedValue}`
    : `${API_BASE_URL}/${trimmedValue}`;
}
