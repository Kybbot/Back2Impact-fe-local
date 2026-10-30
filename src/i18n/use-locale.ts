import { useLocation } from "react-router";

import { LOCALE_TAGS, type Locale } from "./config";
import { getLocaleFromPathname } from "./locale";

/**
 * The locale of the page being rendered.
 *
 * Derived from the pathname rather than from `useTranslation().i18n.language`
 * on purpose: the path is what the router matched, so it is correct on the
 * very first render on both sides. `i18n.language` only catches up once
 * `changeLanguage` has resolved, which would make a component flash the old
 * language for a frame during a locale switch.
 */
export const useLocale = (): Locale => getLocaleFromPathname(useLocation().pathname);

/** the BCP-47 tag for `Intl.*` and `<html lang>` */
export const useLocaleTag = (): string => LOCALE_TAGS[useLocale()];
