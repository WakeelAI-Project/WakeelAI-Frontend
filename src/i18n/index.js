import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslation from "./locales/en.json";
import arTranslation from "./locales/ar.json";

// For debugging purposes in client console
if (typeof window !== "undefined") {
  window.i18nDebug = { enTranslation, arTranslation };
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation // Nest namespaces under the default 'translation' namespace
      },
      ar: {
        translation: arTranslation
      },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "ar"],
    defaultNS: "translation",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

// Handle Layout Direction automatically on document load & language changes
const updateDocumentAttributes = (lng) => {
  if (typeof document !== "undefined" && lng) {
    const cleanLng = lng.split("-")[0]; // handle locale codes like en-US
    const isRtl = cleanLng === "ar";
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = cleanLng;
  }
};

i18n.on("languageChanged", (lng) => {
  updateDocumentAttributes(lng);
});

i18n.on("initialized", () => {
  updateDocumentAttributes(i18n.resolvedLanguage || i18n.language || "en");
});

// Run initially
updateDocumentAttributes(i18n.resolvedLanguage || i18n.language || "en");

export default i18n;
