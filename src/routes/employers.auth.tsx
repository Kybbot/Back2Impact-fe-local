import Auth from "../pages/Auth/Auth";
import { getQueryClient } from "../api/query-client";
import { meQuery } from "../hooks/useCurrentUser";
import { localeFromLocation, metaT } from "../i18n/i18n.static";
import { redirect } from "../i18n/navigation";
import { getHomePath } from "../utils/home-path";
import { SITE_NAME, NOINDEX } from "../utils/seo";
import type { Route } from "./+types/employers.auth";

// signed-in / transactional page: nothing here belongs in an index,
// and robots.txt disallows the path as well
export const meta: Route.MetaFunction = ({ location }) => {
    const t = metaT(localeFromLocation(location), "seo");

    return [{ title: t("employersAuth.title", { site: SITE_NAME }) }, NOINDEX];
};

/**
 * The employer twin of routes/auth.tsx: the same page, signing up an employer
 * account. Client-only for the same reasons, and someone already signed in is
 * sent to their own cabinet.
 */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
    // a failed check must not lock the visitor out of the login page:
    // if we cannot tell, they are treated as signed out — at once, without
    // the retry delay holding the click up
    const user = await getQueryClient()
        .ensureQueryData({ ...meQuery(), revalidateIfStale: true, retry: false })
        .catch(() => null);

    if (user) throw redirect(getHomePath(user), request);

    return null;
}

export function HydrateFallback() {
    return null;
}

export default function EmployersAuthRoute() {
    return <Auth role="employer" />;
}
