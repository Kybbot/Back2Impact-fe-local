import { SUPPORTED_LOCALES, type Locale } from "./config";
import { useLocale } from "./use-locale";

/**
 * The API returns vacancy text in both languages at once, as sibling fields:
 * `nameUk`/`nameEn`, `descriptionUk`/`descriptionEn`, and so on. This is the
 * single place that knows about that convention — components ask for a field
 * by its base name and get the string for the language being rendered.
 *
 * Because both languages arrive in the same response, switching language needs
 * no refetch and the React Query keys stay locale-free.
 */

const FIELD_SUFFIX: Record<Locale, string> = { uk: "Uk", en: "En" };

/** an object carrying `<field>Uk` / `<field>En`, and possibly a legacy `<field>` */
type Localized<K extends string> = Record<`${K}Uk` | `${K}En`, string | null | undefined> &
    Partial<Record<K, string | null>>;

/**
 * Falls back rather than rendering an empty element: the requested language
 * first, then the other one, then the unsuffixed field the API still sends.
 * A vacancy whose English copy has not been filled in is far better shown in
 * Ukrainian than shown as a blank title.
 */
export const pickLocalized = <K extends string>(
    source: Localized<K>,
    field: K,
    locale: Locale,
): string => {
    const record = source as Record<string, string | null | undefined>;

    const candidates = [
        record[`${field}${FIELD_SUFFIX[locale]}`],
        ...SUPPORTED_LOCALES.filter((other) => other !== locale).map(
            (other) => record[`${field}${FIELD_SUFFIX[other]}`],
        ),
        record[field],
    ];

    return candidates.find((value) => typeof value === "string" && value.trim() !== "") ?? "";
};

/** `pickLocalized` bound to the locale in the URL */
export const useLocalized = () => {
    const locale = useLocale();

    return <K extends string>(source: Localized<K>, field: K) => pickLocalized(source, field, locale);
};
