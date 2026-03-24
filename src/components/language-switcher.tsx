"use client";

import { useTranslation } from "@/lib/language-context";
import { localeLabels, type Locale } from "@/lib/i18n";
import { Languages } from "lucide-react";

const locales: Locale[] = ["en", "fr", "de"];

export function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="flex items-center gap-1">
      {!compact && <Languages className="w-4 h-4 text-muted-foreground mr-1" />}
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            locale === l
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  );
}
