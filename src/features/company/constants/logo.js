// Story #168 - Logo upload constants
// These are the single source of truth for all logo validation rules.

export const MAX_LOGO_SIZE = 2 * 1024 * 1024 // 2 MB in bytes

export const ALLOWED_LOGO_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]

export const ALLOWED_LOGO_TYPES_ACCEPT = ALLOWED_LOGO_TYPES.join(",")

export const ALLOWED_LOGO_TYPES_LABEL = "PNG, JPG, JPEG, WEBP"

export const MAX_LOGO_SIZE_LABEL = "2 MB"
