import { Outlet } from "react-router";
import { useRequireUser } from "../hooks/use-require-user";
import useOnboardingRedirect from "../hooks/use-onboarding-redirect";
import { requireUser } from "../utils/require-user";
import { NOINDEX, SITE_NAME } from "../utils/seo";

import type { Route } from "./+types/employers-guarded";

/** covers every page under /employers except the auth page, none export their own */
export const meta: Route.MetaFunction = () => [{ title: SITE_NAME }, NOINDEX];

/**
 * The employer counterpart of routes/guarded.tsx: employers only — a candidate
 * is sent back to their own pages, an anonymous visitor to /employers/auth.
 */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
    await requireUser(request, "employer");

    return null;
}

export function HydrateFallback() {
    return null;
}

export default function EmployersGuardedRoute() {
    useRequireUser("employer");
    useOnboardingRedirect();

    return <Outlet />;
}
