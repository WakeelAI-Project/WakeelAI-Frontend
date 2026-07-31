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

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!baseUrl) {
    return trimmedValue;
  }

  return trimmedValue.startsWith("/")
    ? `${baseUrl}${trimmedValue}`
    : `${baseUrl}/${trimmedValue}`;
}
