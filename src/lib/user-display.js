export function normalizeDisplayName(name) {
  if (typeof name !== "string") return "";
  return name.trim().replace(/\s+/g, " ");
}

export function getUserFullName(user) {
  if (!user) return "";
  return normalizeDisplayName(
    user.full_name ??
      user.fullName ??
      user.name ??
      user.nameEn ??
      "",
  );
}

export function getUserId(user) {
  return user?.user_id ?? user?.userId ?? user?.sub ?? user?.id ?? null;
}

export function getInitials(name, fallback = "") {
  const normalizedName = normalizeDisplayName(name);
  if (!normalizedName) return fallback;

  const parts = normalizedName.split(" ");
  const firstInitial = Array.from(parts[0] ?? "")[0] ?? "";
  const lastInitial =
    parts.length > 1 ? Array.from(parts[parts.length - 1] ?? "")[0] ?? "" : "";

  return `${firstInitial}${lastInitial}`.toLocaleUpperCase();
}

export function getUserInitials(user, fallback = "") {
  return getInitials(getUserFullName(user), fallback);
}
