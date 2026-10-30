/**
 * The API stores the language preference as "ua"/"en" while the URL and
 * i18next use the ISO codes "uk"/"en". Both the language switcher and the
 * settings screen have to cross that line, so the mapping lives here rather
 * than in either of them.
 *
 * Kept out of `config.ts`: that module is read by `app/routes.ts` outside the
 * app bundle and must stay free of application imports.
 */

import type { Locale } from "./config";

import type { UserData } from "@/services/user-service/types";

/** the language as the backend stores it */
export type StoredLanguage = UserData["language"];

export const STORED_TO_LOCALE: Record<StoredLanguage, Locale> = { ua: "uk", en: "en" };

export const LOCALE_TO_STORED: Record<Locale, StoredLanguage> = { uk: "ua", en: "en" };
