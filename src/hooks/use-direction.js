import { useLocale } from "./use-locale";

/**
 * Legacy hook proxying useLocale to maintain layout controls but prevent dual-state issues.
 */
export function useDirection() {
  const { direction, isRtl, changeLanguage } = useLocale();

  const setDirection = (newDir) => {
    changeLanguage(newDir === "rtl" ? "ar" : "en");
  };

  const toggleDirection = () => {
    setDirection(isRtl ? "ltr" : "rtl");
  };

  return {
    dir: direction,
    isRtl,
    setDirection,
    toggleDirection,
  };
}
