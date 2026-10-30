import { useCallback } from "react";

import type { To } from "react-router";

import type { Locale } from "../config";
import { localizePath } from "../locale";
import { useLocale } from "../use-locale";

const localizeTo = (to: To, locale: Locale): To =>
    typeof to === "string"
        ? localizePath(to, locale)
        : { ...to, pathname: to.pathname ? localizePath(to.pathname, locale) : to.pathname };

/** `(to) => to` with the active locale's prefix applied */
export const useLocalizeTo = () => {
    const locale = useLocale();

    return useCallback((to: To) => localizeTo(to, locale), [locale]);
};
