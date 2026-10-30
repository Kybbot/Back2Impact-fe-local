import type { GetOneJobType } from "@/types/jobs";
import { data } from "react-router";
import { ServerApiError, serverApi, sessionHeaders } from "../api/server.server";
import { LOCALE_TAGS, type Locale } from "../i18n/config";
import { localeFromLocation, metaT } from "../i18n/i18n.static";
import { localizePath } from "../i18n/locale";
import { pickLocalized } from "../i18n/pick-localized";
import { useLocale } from "../i18n/use-locale";
import JobBlock from "../pages/Job/JobBlock";
import { isSeniorityLevel } from "../utils/filter-options";
import { CURRENCY_SCHEMA } from "../utils/job-currency";
import { pageCacheHeaders } from "../utils/cache-headers";
import { SITE_NAME, absUrl, metaDescriptionFromHtml, seo } from "../utils/seo";
import type { Route } from "./+types/job";

const SCHEMA_EMPLOYMENT_TYPE: Record<string, string> = {
    full_time: "FULL_TIME",
    part_time: "PART_TIME",
    internship: "INTERN",
    short_term_project: "CONTRACTOR",
    volunteering: "VOLUNTEER",
};

export async function loader({ params, request }: Route.LoaderArgs) {
    try {
        // with the visitor's cookies: score / isSaved / isApplied / applyStatus
        // are theirs already, and a refreshed access token is passed back
        const job = await serverApi(request).get<GetOneJobType>(`/jobs/${params.id}`);

        return data({ job }, { headers: sessionHeaders(request) });
    } catch (error) {
        if (error instanceof ServerApiError && error.status === 404)
            throw new Response("Not Found", { status: 404 });

        // 410 tells a crawler the vacancy is gone for good and can be dropped
        // from the index right away, rather than being retried like a 404
        if (error instanceof ServerApiError && error.status === 410)
            throw new Response("Gone", { status: 410 });

        throw new Response("Upstream error", { status: 502 });
    }
}

/** shared-cacheable for anonymous visitors only, see utils/cache-headers.ts */
export function headers({ parentHeaders }: Route.HeadersArgs) {
    return pageCacheHeaders(parentHeaders, "public, max-age=0, s-maxage=300, stale-while-revalidate=3600");
}

export const meta: Route.MetaFunction = ({ loaderData, location, params }) => {
    const locale = localeFromLocation(location);
    const t = metaT(locale, "seo");

    if (!loaderData?.job) return [{ title: t("jobFallback", { site: SITE_NAME }) }];

    const { job } = loaderData;

    const name = pickLocalized(job, "name", locale);
    const description = pickLocalized(job, "description", locale);

    return seo({
        title: t("job.title", { name, company: job.companyName, site: SITE_NAME }),
        // a vacancy with no description in either language still needs one, or
        // the SERP snippet is whatever Google scrapes off the page
        description: description
            ? metaDescriptionFromHtml(description)
            : t("job.descriptionFallback", { name, company: job.companyName, site: SITE_NAME }),
        path: `/jobs/j/${params.id}`,
        locale,
        image: job.companyLogoUrl,
        type: "article",
    });
};

/**
 * Google's JobPosting requirements, in the order they matter:
 *  - `title`, `description`, `datePosted`, `hiringOrganization` and either
 *    `jobLocation` or `applicantLocationRequirements` are required;
 *  - `validThrough` is optional in the spec but decisive in practice — without
 *    it Google drops a posting from the jobs experience roughly a month after
 *    `datePosted`. The API does not expose an expiry date yet, so it is
 *    omitted here rather than guessed;
 *  - a fully remote role must carry `applicantLocationRequirements` and must
 *    NOT carry a physical `jobLocation`, otherwise it is read as on-site.
 */
function JobPostingJsonLd({ job, locale }: { job: GetOneJobType; locale: Locale }) {
    const isRemote = job.format === "remote";

    const schema = {
        "@context": "https://schema.org/",
        "@type": "JobPosting",
        title: pickLocalized(job, "name", locale),
        description: pickLocalized(job, "description", locale),
        inLanguage: LOCALE_TAGS[locale],
        identifier: {
            "@type": "PropertyValue",
            name: SITE_NAME,
            value: String(job.id),
        },
        datePosted: new Date(job.createdAt).toISOString(),
        employmentType: (job.opportunityTypes ?? []).map((type) => SCHEMA_EMPLOYMENT_TYPE[type] ?? type),
        directApply: true,
        hiringOrganization: {
            "@type": "Organization",
            name: job.companyName,
            ...(job.companyWebsite ? { sameAs: job.companyWebsite } : {}),
            ...(job.companyLogoUrl ? { logo: job.companyLogoUrl } : {}),
        },
        ...(isRemote
            ? {
                  jobLocationType: "TELECOMMUTE",
                  applicantLocationRequirements: {
                      "@type": "Country",
                      name: "UA",
                  },
              }
            : {
                  jobLocation: {
                      "@type": "Place",
                      address: {
                          "@type": "PostalAddress",
                          addressCountry: "UA",
                          ...(job.region ? { addressRegion: job.region } : {}),
                      },
                  },
              }),
        // `currency` is required by Google, so without it (or for an unpaid role) the salary is left out
        ...((job.minimumSalary || job.maximumSalary) && job.currency && job.currency !== "Unpaid"
            ? {
                  baseSalary: {
                      "@type": "MonetaryAmount",
                      currency: CURRENCY_SCHEMA[job.currency].code,
                      value: {
                          "@type": "QuantitativeValue",
                          ...(job.minimumSalary ? { minValue: job.minimumSalary } : {}),
                          ...(job.maximumSalary ? { maxValue: job.maximumSalary } : {}),
                          ...(CURRENCY_SCHEMA[job.currency].unit
                              ? { unitText: CURRENCY_SCHEMA[job.currency].unit }
                              : {}),
                      },
                  },
              }
            : {}),
        ...(isSeniorityLevel(job.seniorityFrom)
            ? { experienceRequirements: metaT(locale, "options")(`seniorityLevels.${job.seniorityFrom}`) }
            : {}),
    };

    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

function BreadcrumbsJsonLd({ job, locale }: { job: GetOneJobType; locale: Locale }) {
    // the crumbs have to point at the URLs of the page they are on, so a
    // localised page does not advertise the other language's trail
    const path = (to: string) => absUrl(localizePath(to, locale));

    const schema = {
        "@context": "https://schema.org/",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: SITE_NAME, item: path("/") },
            {
                "@type": "ListItem",
                position: 2,
                name: metaT(locale, "jobs")("all.heading"),
                item: path("/jobs/all"),
            },
            {
                "@type": "ListItem",
                position: 3,
                name: pickLocalized(job, "name", locale),
                item: path(`/jobs/j/${job.id}`),
            },
        ],
    };

    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function JobRoute({ loaderData, params }: Route.ComponentProps) {
    const locale = useLocale();

    return (
        <>
            <JobPostingJsonLd job={loaderData.job} locale={locale} />
            <BreadcrumbsJsonLd job={loaderData.job} locale={locale} />
            {/* keyed by id so switching vacancies remounts and re-seeds state */}
            <JobBlock key={params.id} className="layout_job-block" initialJob={loaderData.job} />
        </>
    );
}
