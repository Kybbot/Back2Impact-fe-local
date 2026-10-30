/**
 * Shared SEO helpers for every route's `meta` export.
 *
 * `meta` runs on both sides — on the server for the initial HTML and again in
 * the browser on every client-side navigation — so the origin has to resolve
 * identically in both places, otherwise hydration reports a mismatch on the
 * canonical link. `SITE_URL` is therefore read the same way `API_URL` is in
 * `src/api/server.server.ts`: a runtime `process.env` value (server only, so a
 * container can be pointed at a different domain without a rebuild) falling
 * back to the build-time `VITE_SITE_URL` that the browser bundle carries.
 *
 * Set BOTH in production, to the same value.
 */
import { DEFAULT_LOCALE, type Locale, OG_LOCALES, SUPPORTED_LOCALES } from "../i18n/config";
import { localizePath } from "../i18n/locale";

const runtimeSiteUrl = typeof process !== "undefined" ? process.env?.SITE_URL : undefined;

export const SITE_URL = (
    runtimeSiteUrl ??
    import.meta.env.VITE_SITE_URL ??
    "https://back2impact.com"
).replace(/\/+$/, "");

export const SITE_NAME = "Back2Impact";

export const absUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const DEFAULT_OG_IMAGE = absUrl("/img/og-default.png");

/** `robots` for pages that must never reach the index (auth, profile, onboarding). */
export const NOINDEX = { name: "robots", content: "noindex, nofollow" } as const;

/**
 * `follow` — filtered / searched listings are not worth indexing on their own,
 * but the vacancy links on them still are.
 */
export const NOINDEX_FOLLOW = { name: "robots", content: "noindex, follow" } as const;

/**
 * `<link rel="alternate" hreflang>` for one locale-free path, pointing at the
 * same page in every language plus an `x-default`.
 *
 * The set has to be identical on every localised copy of a page — a crawler
 * treats one-way annotations as unconfirmed and drops them — which is why this
 * is derived from the path alone and emitted by `seo()` for all locales rather
 * than written per route.
 */
export const hreflangLinks = (path: string) => [
    ...SUPPORTED_LOCALES.map((locale) => ({
        tagName: "link",
        rel: "alternate",
        // React Router passes descriptor keys through verbatim, so this has to
        // be the HTML attribute name, not React's camelCase prop
        hrefLang: locale,
        href: absUrl(localizePath(path, locale)),
    })),
    // the language-agnostic entry point for a visitor whose language we do not
    // publish; Ukrainian is the default, so it takes the bare URL
    {
        tagName: "link",
        rel: "alternate",
        hrefLang: "x-default",
        href: absUrl(localizePath(path, DEFAULT_LOCALE)),
    },
];

type SeoArgs = {
    title: string;
    description: string;
    /**
     * locale-free path, e.g. `/jobs/all`; `locale` turns it into the canonical,
     * the og:url and the hreflang set
     */
    path: string;
    locale: Locale;
    image?: string | null;
    type?: "website" | "article";
    /** overrides `noindex` etc. appended after the defaults */
    extra?: Record<string, unknown>[];
};

/**
 * One title/description/canonical/OpenGraph/Twitter/hreflang block.
 *
 * React Router replaces a parent route's `meta` with the leaf's rather than
 * merging them, so every indexable route builds its full set through this
 * helper instead of inheriting anything from the root.
 */
export const seo = ({ title, description, path, locale, image, type = "website", extra = [] }: SeoArgs) => {
    // the canonical must be the localised URL, not the bare one: `/en/jobs/all`
    // pointing its canonical at `/jobs/all` would ask Google to drop the entire
    // English site as duplicate content
    const url = absUrl(localizePath(path, locale));
    const ogImage = image || DEFAULT_OG_IMAGE;

    return [
        { title },
        { name: "description", content: description },
        { tagName: "link", rel: "canonical", href: url },

        { property: "og:type", content: type },
        { property: "og:site_name", content: SITE_NAME },
        { property: "og:locale", content: OG_LOCALES[locale] },
        ...SUPPORTED_LOCALES.filter((other) => other !== locale).map((other) => ({
            property: "og:locale:alternate",
            content: OG_LOCALES[other],
        })),
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:image", content: ogImage },

        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },

        ...hreflangLinks(path),

        ...extra,
    ];
};

/**
 * Strips tags and decodes the handful of entities a rich-text editor emits, so
 * a description written as HTML can be used as a meta description.
 * Cut to 160 characters — the point where Google starts truncating.
 */
export const metaDescriptionFromHtml = (html: string, limit = 160) => {
    const text = html
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&[a-z]+;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (text.length <= limit) return text;

    // break on a word boundary rather than mid-word
    const cut = text.slice(0, limit);

    return `${cut.slice(0, cut.lastIndexOf(" ")).trimEnd()}…`;
};
