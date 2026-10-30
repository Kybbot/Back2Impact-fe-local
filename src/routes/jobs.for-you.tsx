import ForYouJobs from "../pages/Jobs/ForYouJobs";
import { localeFromLocation, metaT } from "../i18n/i18n.static";
import { SITE_NAME, NOINDEX } from "../utils/seo";
import type { Route } from "./+types/jobs.for-you";

// signed-in / transactional page: nothing here belongs in an index,
// and robots.txt disallows the path as well
export const meta: Route.MetaFunction = ({ location }) => {
    const t = metaT(localeFromLocation(location), "seo");

    return [{ title: t("jobsForYou.title", { site: SITE_NAME }) }, NOINDEX];
};

// client-only route: a `clientLoader` with no server `loader` plus a
// `HydrateFallback` keeps this component out of the server render
export async function clientLoader() {
    return null;
}

export function HydrateFallback() {
    return null;
}

export default ForYouJobs;
