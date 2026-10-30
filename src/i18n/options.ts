import { useMemo } from "react";

import { type FilterGroup, filterOptions } from "../utils/filter-options";
import {
    type OnboardingOptionGroup,
    countryRegionCodes,
    onboardingOptions,
} from "../utils/onboarding-options";
import { LOCALE_TAGS, type Locale } from "./config";
import { useLocale } from "./use-locale";
import { useT } from "./use-t";

/**
 * Labels for the API codes in `src/utils/filter-options.ts` and
 * `src/utils/onboarding-options.ts`.
 *
 * `defaultValue: code` is the deliberate fallback: when the API starts sending
 * a value this build has no translation for, the filter still renders and
 * still works — it just shows the raw code — instead of throwing or rendering
 * an empty row.
 */
export const useOptionLabel = () => {
    const { t } = useT("options");

    return (group: string, code: string) =>
        // the group/code pair is only known at runtime, so this one lookup is
        // outside the typed-key guarantee the rest of the app gets
        (t as (key: string, options: { defaultValue: string }) => string)(`${group}.${code}`, {
            defaultValue: code,
        });
};

/**
 * Groups that form a scale. Their order in `filterOptions` is the meaning —
 * sorted by label, Ukrainian would put Топменеджмент right after Початковий,
 * since the collator ranks Cyrillic before Latin.
 */
export const SCALE_FILTER_GROUPS: ReadonlySet<FilterGroup> = new Set(["seniorityLevels"]);

/**
 * A filter group as `{ code, label }`, sorted by the label in the current
 * language — the filter headings in the UI advertise "A-Z", and alphabetical
 * order in English is not alphabetical order in Ukrainian. Scales keep their
 * declared order, see `SCALE_FILTER_GROUPS`.
 */
export const useFilterOptions = (group: FilterGroup) => {
    const locale = useLocale();
    const label = useOptionLabel();

    return useMemo(() => {
        const options = filterOptions[group].map((code) => ({
            code: code as string,
            label: label(`filters.${group}`, code),
        }));

        if (SCALE_FILTER_GROUPS.has(group)) return options;

        const collator = new Intl.Collator(LOCALE_TAGS[locale]);

        return options.sort((a, b) => collator.compare(a.label, b.label));
        // `label` is a new closure each render; the locale is what actually
        // changes the result
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [group, locale]);
};

/** 🇺🇦-style flag from an ISO 3166-1 alpha-2 code */
const flagEmoji = (regionCode: string) =>
    String.fromCodePoint(...[...regionCode].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65));

/**
 * One formatter per locale. Building the country list resolves 194 names in a
 * single pass, and `Intl.DisplayNames` is expensive to construct. Safe to keep
 * at module level on the server: it is keyed by locale and holds no request
 * state.
 */
const regionFormatters = new Map<Locale, Intl.DisplayNames>();

const regionFormatter = (locale: Locale) => {
    let formatter = regionFormatters.get(locale);

    if (!formatter) {
        formatter = new Intl.DisplayNames([LOCALE_TAGS[locale]], { type: "region" });
        regionFormatters.set(locale, formatter);
    }

    return formatter;
};

/**
 * A country's name in the current language, with no flag.
 *
 * This is what sorting has to use. A label like "🇦🇩 Андорра" starts with two
 * regional-indicator code points, and a collator compares those first — so
 * sorting the flagged strings orders the list by ISO code, not by name. In
 * English that is nearly invisible (the codes are derived from the English
 * names); in Ukrainian it comes out as Андорра, ОАЕ, Афганістан, Антигуа.
 */
export const countryName = (country: string, locale: Locale) => {
    const regionCode = countryRegionCodes[country];

    if (!regionCode) return country;

    return regionFormatter(locale).of(regionCode) ?? regionCode;
};

/**
 * A country's display name in the current language, with its flag.
 *
 * `Intl.DisplayNames` covers all 194 stored countries in both languages, which
 * is why `onboarding-options.ts` keeps ISO codes rather than text. An unknown
 * code falls back to itself rather than rendering blank.
 */
export const countryLabel = (country: string, locale: Locale, withFlag = true) => {
    const regionCode = countryRegionCodes[country];

    if (!regionCode) return country;

    const name = countryName(country, locale);

    return withFlag ? `${flagEmoji(regionCode)} ${name}` : name;
};

export const useCountryLabel = () => {
    const locale = useLocale();

    return (country: string, withFlag = true) => countryLabel(country, locale, withFlag);
};

/**
 * Left out of the country picker. They stay in `countryRegionCodes`, so a
 * value that is already stored still gets its label.
 */
const EXCLUDED_COUNTRIES: ReadonlySet<string> = new Set(["russian_federation", "belarus"]);

/** shown first in the country picker, in this order in every language */
const PINNED_COUNTRIES = [
    "united_kingdom",
    "spain",
    "germany",
    "poland",
    "united_states",
    "czechia",
    "ukraine",
];

/**
 * The countries the picker offers as `{ code, label }`: `PINNED_COUNTRIES`
 * first, then the rest sorted by name in the current language.
 */
export const useCountryOptions = () => {
    const locale = useLocale();

    return useMemo(() => {
        const collator = new Intl.Collator(LOCALE_TAGS[locale]);

        const pinned = PINNED_COUNTRIES.map((code) => ({ code, label: countryLabel(code, locale) }));

        const rest = Object.keys(countryRegionCodes)
            .filter((code) => !PINNED_COUNTRIES.includes(code) && !EXCLUDED_COUNTRIES.has(code))
            .map((code) => ({
                code,
                label: countryLabel(code, locale),
                // sorted on separately: the flag in `label` would decide the
                // comparison, see `countryName`
                name: countryName(code, locale),
            }))
            .sort((a, b) => collator.compare(a.name, b.name))
            .map(({ code, label }) => ({ code, label }));

        return [...pinned, ...rest];
    }, [locale]);
};

/**
 * An option group as the `{ code: label }` map that `MultiSelectTiles` and
 * `SelectItemPicker` take, translated and ordered for the current language.
 *
 * Insertion order is what those components render in, so the entries are
 * sorted by label before the object is built.
 */
export const useOptionMap = (group: OnboardingOptionGroup) => {
    const locale = useLocale();
    const label = useOptionLabel();

    return useMemo(() => {
        return Object.fromEntries(
            onboardingOptions[group].map((code) => [code, label(`onboarding.${group}`, code)] as const),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [group, locale]);
};

/** the same shape for the country picker */
export const useCountryMap = () => {
    const options = useCountryOptions();

    return useMemo(() => Object.fromEntries(options.map(({ code, label }) => [code, label])), [options]);
};
