import { useMemo } from "react";

import { useLocale } from "./use-locale";
import { LOCALE_TAGS, SUPPORTED_LOCALES, type Locale } from "./config";

import { capitalize } from "../utils/date";
import { languageCodes } from "../utils/language-options";

/**
 * Labels and picker options for the languages in `app/utils/language-options.ts`.
 *
 * One formatter per locale, as `regionFormatters` in `options.ts`.
 * `fallback: "none"` so a name the runtime lacks falls back to the stored
 * English one rather than to the bare code.
 */
const languageFormatters = new Map<Locale, Intl.DisplayNames>();

const languageFormatter = (locale: Locale) => {
    let formatter = languageFormatters.get(locale);

    if (!formatter) {
        formatter = new Intl.DisplayNames([LOCALE_TAGS[locale]], { type: "language", fallback: "none" });
        languageFormatters.set(locale, formatter);
    }

    return formatter;
};

/** capitalised, since CLDR writes Ukrainian language names in lower case, see `capitalize` */
const languageName = (key: string, locale: Locale) =>
    capitalize(languageFormatter(locale).of(languageCodes[key]) ?? key, LOCALE_TAGS[locale]);

/** every name a language goes by, lower-cased, to its key; built on first use */
let languageKeysByName: Map<string, string> | undefined;

/**
 * The `languageCodes` key of a stored language, `undefined` for one that is
 * not there.
 *
 * The field was free text before the picker, so a stored value may also be
 * the language's name in either locale, in any case: "english" and
 * "Англійська" are both "English".
 */
export const languageKey = (language: string) => {
    if (!languageKeysByName) {
        languageKeysByName = new Map();

        for (const key of Object.keys(languageCodes)) {
            languageKeysByName.set(key.toLowerCase(), key);

            for (const locale of SUPPORTED_LOCALES) {
                languageKeysByName.set(languageName(key, locale).toLowerCase(), key);
            }
        }
    }

    return languageKeysByName.get(language.trim().toLowerCase());
};

/** a language's name in the current language; one not in `languageCodes` is shown as typed */
export const languageLabel = (language: string, locale: Locale) => {
    const key = languageKey(language);

    return key ? languageName(key, locale) : language;
};

export const useLanguageLabel = () => {
    const locale = useLocale();

    return (language: string) => languageLabel(language, locale);
};

/** shown first in the language picker, in this order in every language */
const PINNED_LANGUAGES = [
    "Ukrainian",
    "English",
    "German",
    "Polish",
    "Spanish",
    "French",
    "Italian",
    "Czech",
    "Portuguese",
    "Dutch",
];

/**
 * The languages the picker offers as `{ value, label }`: `PINNED_LANGUAGES`
 * first, then the rest sorted by name in the current language.
 */
export const useLanguageOptions = () => {
    const locale = useLocale();

    return useMemo(() => {
        const collator = new Intl.Collator(LOCALE_TAGS[locale]);
        const toOption = (key: string) => ({ value: key, label: languageName(key, locale) });

        const rest = Object.keys(languageCodes)
            .filter((key) => !PINNED_LANGUAGES.includes(key))
            .map(toOption)
            .sort((a, b) => collator.compare(a.label, b.label));

        return [...PINNED_LANGUAGES.map(toOption), ...rest];
    }, [locale]);
};
