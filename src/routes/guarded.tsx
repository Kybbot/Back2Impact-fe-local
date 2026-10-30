import { Outlet } from "react-router";
import { useRequireUser } from "../hooks/use-require-user";
import useOnboardingRedirect from "../hooks/use-onboarding-redirect";
import { requireUser } from "../utils/require-user";
import { NOINDEX, SITE_NAME } from "../utils/seo";

import type { Route } from "./+types/guarded";

/**
 * React Router takes `meta` from the deepest matched route that exports one,
 * so this single declaration covers every page under /onboarding and /profile —
 * none of them export their own.
 */
export const meta: Route.MetaFunction = () => [{ title: SITE_NAME }, NOINDEX];

/**
 * The guard runs before anything renders: no user, no page. Everything below
 * this layout is client-only, so the `clientLoader` also runs on hydration —
 * that is the one `/user/me` request a signed-in visitor pays on a full load.
 */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
    await requireUser(request);

    return null;
}

export function HydrateFallback() {
    return null;
}

export default function GuardedRoute() {
    // the loader decides on the way in; this notices the session ending
    // while a page is open
    useRequireUser();
    useOnboardingRedirect();

    return <Outlet />;
}
