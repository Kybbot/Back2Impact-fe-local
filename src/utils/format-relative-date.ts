import { LOCALE_TAGS, type Locale } from "../i18n/config";
import { useLocale } from "../i18n/use-locale";

/**
 * `Intl.RelativeTimeFormat` is not free to construct, and this runs once per
 * vacancy card in a list, so the formatters are built once per locale and
 * reused. Both are created eagerly rather than lazily so the server and the
 * browser cannot end up with differently-configured instances.
 */
const formatters = Object.fromEntries(
    Object.entries(LOCALE_TAGS).map(([locale, tag]) => [
        locale,
        new Intl.RelativeTimeFormat(tag, { numeric: "auto" }),
    ]),
) as Record<Locale, Intl.RelativeTimeFormat>;

export const formatRelativeDate = (date: Date | string, locale: Locale): string => {
    const dateObject = typeof date === "string" ? new Date(date) : date;
    const formatter = formatters[locale];

    const now = Date.now();
    const diff = dateObject.getTime() - now;

    const seconds = Math.round(diff / 1000);

    if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");

    const minutes = Math.round(seconds / 60);

    if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");

    const hours = Math.round(minutes / 60);

    if (Math.abs(hours) < 24) return formatter.format(hours, "hour");

    const days = Math.round(hours / 24);

    if (Math.abs(days) < 30) return formatter.format(days, "day");

    const months = Math.round(days / 30);

    if (Math.abs(months) < 12) return formatter.format(months, "month");

    const years = Math.round(months / 12);

    return formatter.format(years, "year");
};

/** the component-facing form: same thing, locale taken from the URL */
export const useFormatRelativeDate = () => {
    const locale = useLocale();

    return (date: Date | string) => formatRelativeDate(date, locale);
};
