import { useOptionLabel } from "../../../../i18n/options";
import { languageKey, useLanguageOptions } from "../../../../i18n/language-options";

import type {
    UserLanguageType,
    GetUserLanguagesType,
    AddUserEducationBodyType,
} from "../../../../services/user-service/types";

/**
 * Values the education and language forms send to the API. As elsewhere, only
 * the codes live in code — the labels are in the `options` namespace of the
 * translations, keyed by these same codes.
 *
 * Unlike the filter groups these are never sorted alphabetically: a degree
 * ladder and the CEFR scale both have a meaningful order, so the arrays are
 * rendered as written.
 */
export const degreeCodes: NonNullable<AddUserEducationBodyType["degree"]>[] = [
    "bachelors",
    "masters",
    "phd",
    "other",
];

export const languageLevelCodes: UserLanguageType["level"][] = ["a1", "a2", "b1", "b2", "c1", "c2", "native"];

export const useDegreeOptions = () => {
    const label = useOptionLabel();

    return degreeCodes.map((id) => ({ id, name: label("experience.degrees", id) }));
};

export const useLanguageLevelOptions = () => {
    const label = useOptionLabel();

    return languageLevelCodes.map((id) => ({ id, name: label("experience.languageLevels", id) }));
};

/**
 * The language picker's options for an entry of `languages` — `index` when
 * editing one, none for a new one. A language is listed once, so those the
 * other entries already have are left out.
 */
export const useLanguagePickerOptions = (languages: GetUserLanguagesType, index?: number) => {
    const options = useLanguageOptions();

    const taken = new Set(
        languages.filter((_, itemIndex) => itemIndex !== index).map((item) => languageKey(item.language)),
    );
    const available = options.filter((option) => !taken.has(option.value));

    const current = index === undefined ? undefined : languages[index]?.language;

    // free text from before the picker that matches no language stays an option,
    // so such an entry can still be saved with only its level changed
    if (current && !languageKey(current)) return [{ value: current, label: current }, ...available];

    return available;
};
