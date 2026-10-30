import { serverApi } from "../api/server.server";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../i18n/config";
import { localizePath } from "../i18n/locale";
import { absUrl } from "../utils/seo";

import type { Route } from "./+types/sitemap";

/**
 * The format allows 50 000 URLs per file. Past that the file has to be split
 * and fronted by a sitemap index — an explicit failure beats silently dropping
 * the tail, so the count is checked rather than sliced.
 *
 * Every entry is emitted once per locale, so the effective ceiling on
 * vacancies is this divided by the number of languages. The check below counts
 * the rendered URLs, not the entries, so it stays honest as locales are added.
 */
const SITEMAP_URL_LIMIT = 50_000;

type SitemapJob = {
    id: number;
    /** ISO 8601 string; becomes <lastmod> */
    lastEditedAt: string;
};

type SitemapEntry = {
    path: string;
    lastmod?: string;
    changefreq: "daily" | "weekly" | "monthly";
    priority: string;
};

const STATIC_ENTRIES: SitemapEntry[] = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/jobs/all", changefreq: "daily", priority: "0.9" },
];

const escapeXml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

/** an unparseable date is dropped rather than emitted as "Invalid Date" */
const toIsoDate = (value: string) => {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
};

const fetchJobEntries = async (request: Request): Promise<SitemapEntry[]> => {
    const jobs = await serverApi(request).get<SitemapJob[]>("/jobs/sitemap");

    return jobs.map((job) => ({
        path: `/jobs/j/${job.id}`,
        lastmod: toIsoDate(job.lastEditedAt),
        changefreq: "weekly",
        priority: "0.8",
    }));
};

/**
 * One `<url>` per locale per page, each carrying the full set of `xhtml:link`
 * alternates. Google requires the annotation to be reciprocal — every language
 * version has to list every other one, itself included — so the same block is
 * repeated in each entry rather than only on the default.
 */
const renderUrl = ({ path, lastmod, changefreq, priority }: SitemapEntry) => {
    const alternates = [
        ...SUPPORTED_LOCALES.map(
            (locale) =>
                `<xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(absUrl(localizePath(path, locale)))}"/>`,
        ),
        `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(absUrl(localizePath(path, DEFAULT_LOCALE)))}"/>`,
    ];

    return SUPPORTED_LOCALES.map((locale) =>
        [
            "    <url>",
            `        <loc>${escapeXml(absUrl(localizePath(path, locale)))}</loc>`,
            ...(lastmod ? [`        <lastmod>${lastmod}</lastmod>`] : []),
            `        <changefreq>${changefreq}</changefreq>`,
            `        <priority>${priority}</priority>`,
            ...alternates,
            "    </url>",
        ].join("\n"),
    ).join("\n");
};

export async function loader({ request }: Route.LoaderArgs) {
    let jobEntries: SitemapEntry[] = [];

    try {
        jobEntries = await fetchJobEntries(request);
    } catch {
        // an API hiccup must not turn the sitemap into a 500 — serving the
        // static entries keeps the file valid and the next crawl picks the
        // vacancies back up
    }

    const entries = [...STATIC_ENTRIES, ...jobEntries];

    const urlCount = entries.length * SUPPORTED_LOCALES.length;

    if (urlCount > SITEMAP_URL_LIMIT)
        throw new Error(
            `Sitemap holds ${urlCount} URLs (${entries.length} pages x ${SUPPORTED_LOCALES.length} locales), ` +
                `over the ${SITEMAP_URL_LIMIT} a single file allows. ` +
                "Split it into per-chunk sitemaps behind a <sitemapindex>.",
        );

    const body = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        ...entries.map(renderUrl),
        "</urlset>",
        "",
    ].join("\n");

    return new Response(body, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=86400",
        },
    });
}
