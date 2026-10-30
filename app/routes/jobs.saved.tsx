import SavedJobs from "../pages/Jobs/SavedJobs";
import { useRequireUser } from "../hooks/use-require-user";
import { localeFromLocation, metaT } from "../i18n/i18n.static";
import { requireUser } from "../utils/require-user";
import { SITE_NAME, NOINDEX } from "../utils/seo";
import type { Route } from "./+types/jobs.saved";

// signed-in / transactional page: nothing here belongs in an index,
// and robots.txt disallows the path as well
export const meta: Route.MetaFunction = ({ location }) => {
    const t = metaT(localeFromLocation(location), "seo");

    return [{ title: t("jobsSaved.title", { site: SITE_NAME }) }, NOINDEX];
};

// a signed-in feed living under the public /jobs subtree, so it carries its
// own guard rather than sitting under routes/guarded.tsx
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
    await requireUser(request);

    return null;
}

export function HydrateFallback() {
    return null;
}

export default function SavedJobsRoute() {
    useRequireUser();

    return <SavedJobs />;
}
