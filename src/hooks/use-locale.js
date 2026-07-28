import { useTranslation } from "react-i18next";

/**
 * Reusable React Hook returning current locale state, layout direction, and language controls.
 */
export function useLocale() {
  const { t, i18n } = useTranslation();
  const language = i18n.language || "en";
  const isRtl = language.startsWith("ar");
  const direction = isRtl ? "rtl" : "ltr";

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return {
    t,
    language,
    isRtl,
    isRTL: isRtl, // Support both capitalization styles requested
    changeLanguage,
    direction,
  };
}
