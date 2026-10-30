import { LOCALE_TAGS, type Locale } from "../i18n/config";
import { useLocale } from "../i18n/use-locale";

/**
 * Month names for the date pickers in the profile.
 *
 * Built from `Intl.DateTimeFormat` rather than a hardcoded list so a new
 * locale needs no new array — and so Ukrainian gets the right case. Note the
 * "1" day: some locales render a standalone month differently from one inside
 * a full date, and using `month: "long"` on its own is what asks for the
 * standalone form.
 *
 * `id` stays the 1-based month number the API expects, unchanged.
 */
/**
 * Ukrainian orthography writes month names in lower case, and that is what
 * CLDR returns — correct inside a sentence, wrong for a picker where each
 * option stands on its own next to a capitalised English list. So the first
 * letter is upper-cased for display.
 *
 * `toLocaleUpperCase` rather than `toUpperCase`, and the spread rather than
 * `charAt(0)`, so this stays correct for a locale with a special casing rule
 * or a name outside the BMP.
 *
 * `month: "long"` on its own asks for the standalone form — Ukrainian needs
 * the nominative "січень" here, not the genitive "січня" a full date would use.
 */
export const capitalize = (value: string, tag: string) => {
    const [first, ...rest] = [...value];

    return first ? first.toLocaleUpperCase(tag) + rest.join("") : value;
};

export const monthsFull = (locale: Locale) => {
    const tag = LOCALE_TAGS[locale];
    const formatter = new Intl.DateTimeFormat(tag, { month: "long" });

    return Array.from({ length: 12 }, (_, index) => ({
        id: String(index + 1),
        name: capitalize(formatter.format(new Date(Date.UTC(2000, index, 1))), tag),
    }));
};

export const useMonthsFull = () => monthsFull(useLocale());

/** "18 Aug", with the year only when it isn't this one */
export const useFormatShortDate = () => {
    const tag = LOCALE_TAGS[useLocale()];

    return (value: Date | string) => {
        const date = new Date(value);
        const isThisYear = date.getFullYear() === new Date().getFullYear();

        return new Intl.DateTimeFormat(tag, {
            day: "numeric",
            month: "short",
            year: isThisYear ? undefined : "numeric",
        }).format(date);
    };
};

/** `yyyy-mm-dd` in the local time zone — how the forms keep a picked day */
export const toDateValue = (date: Date) =>
    [date.getFullYear(), date.getMonth() + 1, date.getDate()]
        .map((part) => String(part).padStart(2, "0"))
        .join("-");

/** the local midnight of a `yyyy-mm-dd` day; `new Date(value)` would read it as UTC */
export const parseDateValue = (value: string) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : undefined;
};

export const years = () => {
    const years = [];

    let startYear = new Date().getFullYear();
    const finalYear = 1980;

    while (startYear >= finalYear) {
        years.push(startYear--);
    }

    return years;
};
