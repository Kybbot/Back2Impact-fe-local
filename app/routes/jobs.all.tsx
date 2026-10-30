import { data, type ShouldRevalidateFunctionArgs } from "react-router";
import { serverApi, sessionHeaders } from "../api/server.server";
import { JOBS_PAGE_SIZE } from "../hooks/use-default-jobs-infinite";
import type { Locale } from "../i18n/config";
import { localeFromLocation, metaT } from "../i18n/i18n.static";
import { localizePath } from "../i18n/locale";
import { pickLocalized } from "../i18n/pick-localized";
import { useLocale } from "../i18n/use-locale";
import { useT } from "../i18n/use-t";
import AllJobs from "../pages/Jobs/AllJobs";
import { pageCacheHeaders } from "../utils/cache-headers";
import { SITE_NAME, absUrl, seo } from "../utils/seo";
import type { Route } from "./+types/jobs.all";
import type { GetAllJobsListType, JobListType } from "@/types/jobs";

const PATH = "/jobs/all";

/** `?page=N`, clamped to a sane integer so a hand-edited URL cannot fan out */
const readPage = (url: string) => {
    const raw = Number(new URL(url).searchParams.get("page") ?? 1);

    return Number.isInteger(raw) && raw >= 1 && raw <= 1000 ? raw : 1;
};

const pagePath = (page: number) => (page > 1 ? `${PATH}?page=${page}` : PATH);

/**
 * Sent with the visitor's cookies, so a signed-in visitor gets their personal
 * fields (score / isSaved / isApplied) in the server render. The anonymous
 * page is still identical for everyone and stays cacheable, see `headers`.
 */
export async function loader({ request }: Route.LoaderArgs) {
    const page = readPage(request.url);

    const firstPage = await serverApi(request).post<GetAllJobsListType>("/jobs", {
        page,
        pageSize: JOBS_PAGE_SIZE,
        tab: "all",
        sortType: "all",
        searchString: "",
        professionalAreas: [],
        spheres: [],
        workFormats: [],
        employmentTypes: [],
        seniorityLevels: [],
    });

    return data({ firstPage, page }, { headers: sessionHeaders(request) });
}

/**
 * The filters live in the query string, and every checkbox toggle is therefore
 * a navigation. This loader only ever answers the unfiltered `?page=N` feed, so
 * anything else in the query string leaves its data untouched — otherwise a
 * click on a filter would cost a server round trip for a page nobody renders.
 */
export function shouldRevalidate({
    currentUrl,
    nextUrl,
    defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
    if (currentUrl.pathname !== nextUrl.pathname) return defaultShouldRevalidate;

    return readPage(currentUrl.href) !== readPage(nextUrl.href);
}

/** shared-cacheable for anonymous visitors only, see utils/cache-headers.ts */
export function headers({ parentHeaders }: Route.HeadersArgs) {
    return pageCacheHeaders(parentHeaders, "public, max-age=0, s-maxage=120, stale-while-revalidate=600");
}

export const meta: Route.MetaFunction = ({ loaderData, location }) => {
    const locale = localeFromLocation(location);
    const t = metaT(locale, "seo");

    const page = loaderData?.page ?? 1;
    const hasNextPage = loaderData?.firstPage.hasNextPage ?? false;

    // prev/next must point at the same locale's pages, so the prefix goes on
    // before the URL is made absolute
    const pageUrl = (value: number) => absUrl(localizePath(pagePath(value), locale));

    return [
        ...seo({
            title:
                page > 1
                    ? t("jobsAll.titlePaged", { page, site: SITE_NAME })
                    : t("jobsAll.title", { site: SITE_NAME }),
            description: t("jobsAll.description"),
            path: pagePath(page),
            locale,
        }),
        // paginated URLs are indexable in their own right; prev/next tell a
        // crawler they are one sequence rather than near-duplicates
        ...(page > 1 ? [{ tagName: "link", rel: "prev", href: pageUrl(page - 1) }] : []),
        ...(hasNextPage ? [{ tagName: "link", rel: "next", href: pageUrl(page + 1) }] : []),
    ];
};

/** ItemList of the server-rendered page, so the listing itself is machine-readable */
function JobsItemListJsonLd({ page, jobs, locale }: { page: number; jobs: JobListType[]; locale: Locale }) {
    const url = (path: string) => absUrl(localizePath(path, locale));

    const schema = {
        "@context": "https://schema.org/",
        "@type": "ItemList",
        name: metaT(locale, "jobs")("all.heading"),
        url: url(pagePath(page)),
        numberOfItems: jobs.length,
        itemListElement: jobs.map((job, index) => ({
            "@type": "ListItem",
            position: (page - 1) * JOBS_PAGE_SIZE + index + 1,
            url: url(`/jobs/j/${job.id}`),
            name: pickLocalized(job, "name", locale),
        })),
    };

    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function AllJobsRoute({ loaderData }: Route.ComponentProps) {
    const locale = useLocale();
    const { t } = useT("jobs");

    return (
        <>
            <JobsItemListJsonLd page={loaderData.page} jobs={loaderData.firstPage.data} locale={locale} />
            <AllJobs
                initialPage={loaderData.firstPage}
                initialPageNumber={loaderData.page}
                heading={t("all.heading")}
                paginationPath={PATH}
            />
        </>
    );
}
