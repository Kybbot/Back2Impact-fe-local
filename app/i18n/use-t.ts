import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { type Namespace } from "./config";
import { useLocale } from "./use-locale";

/**
 * `useTranslation` pinned to the locale in the URL.
 *
 * Passing `lng` makes react-i18next resolve through `getFixedT(lng, ns)`
 * inside its snapshot, so the language a component renders in is decided
 * synchronously by the path that was matched. Without it the hook would follow
 * `i18n.language`, which only catches up after `changeLanguage` resolves — a
 * client-side navigation from `/jobs/all` to `/en/jobs/all` would then paint
 * one frame of Ukrainian inside the English page.
 *
 * Use this everywhere instead of `useTranslation` directly.
 */
export const useT = <N extends Namespace>(ns: N) => useTranslation(ns, { lng: useLocale() });

/**
 * Keeps `i18n.language` in step with the URL.
 *
 * Rendering does not need this — `useT` is already pinned to the path — but
 * anything reading the instance directly (a `Trans` fallback, a plain
 * `i18n.t` outside React, the devtools) would otherwise report whichever
 * language the page happened to load in. Mounted once, in the root layout.
 */
export const useSyncLocale = () => {
    const locale = useLocale();
    const { i18n } = useTranslation();

    useEffect(() => {
        if (i18n.language !== locale) void i18n.changeLanguage(locale);
    }, [i18n, locale]);
};
