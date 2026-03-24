import en from "./en";
import type { Translations } from "./en";
import fr from "./fr";
import de from "./de";

export type Locale = "en" | "fr" | "de";

export const translations: Record<Locale, Translations> = { en, fr, de };

export const localeLabels: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  de: "DE",
};

export type { Translations };
