/**
 * Single source of truth for which languages exist and how they map onto URLs.
 *
 * Imported by `src/routes.ts`, which runs inside the React Router config
 * loader rather than the app bundle — keep this module free of any browser or
 * React import so both worlds can read it.
 */

export const SUPPORTED_LOCALES = ["uk", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Ukrainian is served from the bare path (`/jobs/all`); every other locale
 * lives behind its own prefix (`/en/jobs/all`). Changing this would move the
 * whole site, so it is deliberately a constant rather than a runtime setting.
 */
export const DEFAULT_LOCALE: Locale = "uk";

/** the locales that carry a URL prefix — i.e. everything but the default */
export const NON_DEFAULT_LOCALES = SUPPORTED_LOCALES.filter(
    (locale) => locale !== DEFAULT_LOCALE,
);

export const isLocale = (value: unknown): value is Locale =>
    typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value);

/** i18next namespaces, one JSON file per locale in `public/locales/<lng>/` */
export const NAMESPACES = [
    "common",
    "home",
    "auth",
    "jobs",
    "job",
    "onboarding",
    "profile",
    "employers",
    "options",
    "seo",
    "errors",
] as const;

export type Namespace = (typeof NAMESPACES)[number];

export const DEFAULT_NAMESPACE: Namespace = "common";

/** BCP-47 tags for `Intl.*` and `<html lang>`; i18next itself keys off `Locale` */
export const LOCALE_TAGS: Record<Locale, string> = {
    uk: "uk-UA",
    en: "en-US",
};

/** OpenGraph wants underscores, not hyphens */
export const OG_LOCALES: Record<Locale, string> = {
    uk: "uk_UA",
    en: "en_US",
};

/**
 * Shared i18next options, spread into the per-request server instance and the
 * browser one alike. Anything that differs between the two (the backend, the
 * detected language) is passed in on top of this.
 */
export const i18nConfig = {
    supportedLngs: SUPPORTED_LOCALES,
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: DEFAULT_NAMESPACE,
    ns: NAMESPACES,
    // React escapes everything it renders already
    interpolation: { escapeValue: false },
} as const;
