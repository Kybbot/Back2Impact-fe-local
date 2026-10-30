import { useEffect } from "react";
import { useLocation } from "react-router";
import { stripLocaleFromPathname } from "../i18n/locale";
import { useNavigate } from "../i18n/navigation";
import { getSetupPath, getSetupPrefix } from "../utils/home-path";
import useCurrentUser from "./useCurrentUser";

/**
 * A user who signed up but never finished onboarding (or, for an employer,
 * the company setup) is pushed back into it.
 * Client-only on purpose: it navigates from an effect, so on the server it is
 * a no-op and the page still server-renders.
 *
 * The routes check this in their loaders on the way in (the guarded ones in
 * `clientLoader`, the public layout on the server too); this hook is the
 * fallback for what a loader cannot see: a user the server failed to ask
 * about, or a session that changes while a page is open.
 */
export default function useOnboardingRedirect() {
    const { pathname } = useLocation();
    const { data: user, isPending } = useCurrentUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (isPending) return;
        if (!user || user.status !== "created") return;
        // the prefix has to come off first: on /en/onboarding/cv the raw
        // pathname does not start with /onboarding, so the guard would miss
        // and bounce the user out of the step they are already on
        if (stripLocaleFromPathname(pathname).startsWith(getSetupPrefix(user))) return;

        navigate(getSetupPath(user), { replace: true });
    }, [isPending, user, pathname, navigate]);
}
