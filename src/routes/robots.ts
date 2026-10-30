import { SUPPORTED_LOCALES } from "../i18n/config";
import { localizePath } from "../i18n/locale";
import { SITE_URL, absUrl } from "../utils/seo";

/** crawlable in every language */
const ALLOWED = ["/jobs/all", "/jobs/j/"];

/**
 * Everything behind a login is disallowed: those pages render nothing useful
 * to an anonymous crawler and would only burn crawl budget. The personalised
 * job feeds are in the same group — same vacancies as /jobs/all, ordered per
 * user, so indexing them would only create duplicates.
 */
const DISALLOWED = [
    "/auth",
    "/verify-email",
    "/reset-password",
    "/onboarding",
    "/profile",
    "/employers",
    "/jobs/for-you",
    "/jobs/saved",
    "/jobs/applied",
];

/**
 * Resource route (no component) served at /robots.txt.
 *
 * Each rule is emitted once per locale, because `/en/profile` is a different
 * URL from `/profile` and a rule for one says nothing about the other.
 */
export function loader() {
    const perLocale = (paths: string[]) =>
        SUPPORTED_LOCALES.flatMap((locale) => paths.map((path) => localizePath(path, locale)));

    const body = [
        "User-agent: *",
        // the home page itself, in each language, and nothing below it by this rule
        ...SUPPORTED_LOCALES.map((locale) => `Allow: ${localizePath("/", locale)}$`),
        ...perLocale(ALLOWED).map((path) => `Allow: ${path}`),
        ...perLocale(DISALLOWED).map((path) => `Disallow: ${path}`),
        "",
        `Host: ${SITE_URL}`,
        `Sitemap: ${absUrl("/sitemap.xml")}`,
        "",
    ].join("\n");

    return new Response(body, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=86400",
        },
    });
}
