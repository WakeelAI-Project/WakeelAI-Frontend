/**
 * Detects whether the provided text content is predominantly Arabic.
 * Evaluates the ratio of Arabic characters against Latin/alphabetical characters.
 * Non-alphabetical characters (whitespace, punctuation, numbers, markdown symbols) are excluded.
 *
 * @param {string | null | undefined} text - The text content to analyze.
 * @param {number} [threshold=0.4] - The ratio threshold above which text is considered RTL (default 0.4).
 * @returns {boolean} True if predominantly Arabic (RTL), false otherwise (LTR).
 */
export function isPredominantlyArabic(text, threshold = 0.4) {
  if (!text || typeof text !== "string") {
    return false;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return false;
  }

  // Match Arabic letter ranges (basic Arabic, supplement, extended, presentation forms)
  const arabicMatches = trimmed.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFE]/g);
  const arabicCount = arabicMatches ? arabicMatches.length : 0;

  // Match Latin letters
  const latinMatches = trimmed.match(/[a-zA-Z]/g);
  const latinCount = latinMatches ? latinMatches.length : 0;

  const totalLetters = arabicCount + latinCount;
  if (totalLetters === 0) {
    // If no letters at all, fallback to whether any Arabic characters exist
    return arabicCount > 0;
  }

  return (arabicCount / totalLetters) > threshold;
}
