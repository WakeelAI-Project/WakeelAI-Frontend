// Story #168 - Image validation utility
// Pure validation logic with no side-effects; no API calls, no React, no toast.
// The caller decides what to do with the returned result.

import {
  ALLOWED_LOGO_TYPES,
  ALLOWED_LOGO_TYPES_LABEL,
  MAX_LOGO_SIZE,
  MAX_LOGO_SIZE_LABEL,
} from "../constants/logo"

/**
 * Validates a file against the logo upload rules.
 *
 * @param {File} file - The File object to validate.
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateLogo(file) {
  if (!file) {
    return { valid: false, error: "No file provided." }
  }

  if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Only ${ALLOWED_LOGO_TYPES_LABEL} images are allowed.`,
    }
  }

  if (file.size > MAX_LOGO_SIZE) {
    return {
      valid: false,
      error: `Image size must not exceed ${MAX_LOGO_SIZE_LABEL}.`,
    }
  }

  return { valid: true }
}
