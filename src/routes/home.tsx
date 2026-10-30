import { LOCALE_TAGS, type Locale } from "../i18n/config";
import { localeFromLocation, metaT } from "../i18n/i18n.static";
import { useLocale } from "../i18n/use-locale";
import Main from "../pages/Main/Main";
import { SITE_NAME, SITE_URL, absUrl, seo } from "../utils/seo";
import type { Route } from "./+types/home";

export const meta: Route.MetaFunction = ({ location }) => {
    const locale = localeFromLocation(location);
    const t = metaT(locale, "seo");

    return seo({
        title: t("home.title", { site: SITE_NAME }),
        description: t("home.description"),
        path: "/",
        locale,
    });
};

/**
 * Identity of the site itself. Unlike the per-vacancy JobPosting this is not
 * eligible for a rich result on its own — it is what ties the domain, the name
 * and the logo together for the knowledge panel.
 */
function SiteJsonLd({ locale }: { locale: Locale }) {
    const t = metaT(locale, "seo");

    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": `${SITE_URL}/#organization`,
                name: SITE_NAME,
                url: SITE_URL,
                logo: absUrl("/favicon.svg"),
                description: t("home.description"),
            },
            {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                name: SITE_NAME,
                url: SITE_URL,
                publisher: { "@id": `${SITE_URL}/#organization` },
                inLanguage: LOCALE_TAGS[locale],
            },
        ],
    };

    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function HomeRoute() {
    const locale = useLocale();

    return (
        <>
            <SiteJsonLd locale={locale} />
            <Main />
        </>
    );
}
