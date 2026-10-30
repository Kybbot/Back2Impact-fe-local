import { DEFAULT_LOCALE, type Locale, isLocale } from "./config";

/**
 * The URL is the single source of truth for the locale — not a cookie, not
 * `Accept-Language`. `/jobs/all` is Ukrainian, `/en/jobs/all` is English, and
 * nothing else can override that. It keeps a shared link unambiguous, keeps
 * the server and the browser from ever disagreeing about which language to
 * render, and lets the CDN cache a page under its own URL.
 *
 * Everything here is pure string work so the same helpers run in a loader, in
 * a component and inside `entry.client.tsx` before React exists.
 */

/** splits `/en/jobs/all` into `["en", "jobs", "all"]`, tolerating extra slashes */
const segments = (pathname: string) => pathname.split("/").filter(Boolean);

/**
 * `/en/jobs` and the bare `/en` are English; `/english` is not — the prefix
 * only counts as a whole path segment.
 */
export const getLocaleFromPathname = (pathname: string): Locale => {
    const [first] = segments(pathname);

    return isLocale(first) && first !== DEFAULT_LOCALE ? first : DEFAULT_LOCALE;
};

/**
 * The locale-free path, i.e. what the route tree matches on: `/en/jobs/all`
 * and `/jobs/all` both come back as `/jobs/all`. Always leading-slashed, never
 * trailing-slashed (except for the root itself).
 */
export const stripLocaleFromPathname = (pathname: string): string => {
    const parts = segments(pathname);

    if (isLocale(parts[0]) && parts[0] !== DEFAULT_LOCALE) parts.shift();

    return parts.length ? `/${parts.join("/")}` : "/";
};

/**
 * Turns an internal, locale-free path into one for `locale`. The default
 * locale is served bare, so it is returned untouched.
 *
 * Absolute URLs, protocol-relative URLs, `mailto:`/`tel:` and pure fragments
 * are passed through: they are not ours to prefix.
 */
export const localizePath = (path: string, locale: Locale): string => {
    if (locale === DEFAULT_LOCALE) return path;
    if (!path.startsWith("/") || path.startsWith("//")) return path;

    // a path already carrying the prefix must not get a second one
    if (path === `/${locale}` || path.startsWith(`/${locale}/`)) return path;

    return path === "/" ? `/${locale}` : `/${locale}${path}`;
};

/**
 * The current page's twin in another language, query string and hash kept —
 * what the language switcher links to.
 */
export const switchLocalePath = (
    { pathname, search = "", hash = "" }: { pathname: string; search?: string; hash?: string },
    locale: Locale,
): string => `${localizePath(stripLocaleFromPathname(pathname), locale)}${search}${hash}`;
