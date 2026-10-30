import { createInstance, type TFunction } from "i18next";

import { type Locale, type Namespace, i18nConfig } from "./config";
import { getLocaleFromPathname } from "./locale";
import { resources } from "./resources";

/**
 * A read-only i18next used from `meta` exports, which run outside React and so
 * cannot reach the request-scoped instance through context.
 *
 * Sharing one module-level instance across requests is safe *only* because
 * nothing ever mutates it: `changeLanguage` is never called, and every lookup
 * goes through `getFixedT(locale, ns)`, which resolves against the language it
 * is handed rather than the instance's current one. Do not add a
 * `changeLanguage` call here — that is exactly the cross-request leak the
 * per-request instance in `entry.server.tsx` exists to avoid.
 *
 * `init` is synchronous because every translation is bundled (see
 * `resources.ts`); there is no backend to wait for.
 */
const staticI18n = createInstance();

void staticI18n.init({ ...i18nConfig, resources, lng: i18nConfig.fallbackLng });

/**
 * `t` bound to a locale, for `meta`.
 *
 * @example
 * export const meta: Route.MetaFunction = ({ location }) => {
 *     const locale = localeFromLocation(location);
 *     const t = metaT(locale, "seo");
 *     return seo({ title: t("jobs.title"), ... , locale });
 * };
 */
export const metaT = <N extends Namespace>(locale: Locale, ns: N): TFunction<N> =>
    staticI18n.getFixedT(locale, ns);

/**
 * The locale of the page a `meta` function is building. React Router hands
 * `meta` the matched `location`, which is all the locale depends on.
 */
export const localeFromLocation = (location: { pathname: string }): Locale =>
    getLocaleFromPathname(location.pathname);
