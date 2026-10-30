import { useEffect } from "react";

import { useNavigate } from "../i18n/navigation";
import type { UserRole } from "../services/user-service/types";
import { getHomePath, getLoginPath } from "../utils/home-path";
import useCurrentUser from "./useCurrentUser";

/**
 * The role half of the guard on its own, for layouts an anonymous visitor may
 * open too: an account of the other kind is sent to its own cabinet. That
 * covers a session that changes while the page is open — a login in another
 * tab, noticed on window focus — and a user the server failed to ask about.
 */
export function useRequireRole(role: UserRole = "candidate") {
    const { data: user } = useCurrentUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role !== role) navigate(getHomePath(user), { replace: true });
    }, [user, role, navigate]);
}

/**
 * The in-page half of the guard. `requireUser` in the `clientLoader` decides
 * whether a navigation is allowed in; this notices the session ending while
 * the page is open — a failed refresh on any request, a logout, a background
 * re-check — because all of those set the `me` query to `null`, and the
 * session turning into an account of the other kind (see `useRequireRole`).
 */
export function useRequireUser(role: UserRole = "candidate") {
    const { data: user } = useCurrentUser();
    const navigate = useNavigate();

    useRequireRole(role);

    useEffect(() => {
        if (user === null) navigate(getLoginPath(role), { replace: true });
    }, [user, role, navigate]);
}
