import { getQueryClient } from "../api/query-client";
import { meQuery } from "../hooks/useCurrentUser";
import { stripLocaleFromPathname } from "../i18n/locale";
import { redirect } from "../i18n/navigation";
import type { UserRole } from "../services/user-service/types";
import { getHomePath, getLoginPath, getSetupPath, getSetupPrefix } from "./home-path";

/**
 * The guard for `clientLoader`s of signed-in-only routes. It answers from the
 * cache when it can — `ensureQueryData` only goes to the network when there is
 * nothing cached, and revalidates a stale answer in the background — so a
 * navigation between guarded pages costs no request.
 *
 * `role` is who the route is for: an account of the other kind is sent to its
 * own cabinet, an anonymous visitor to the matching login page.
 *
 * Client-only by construction: it reads the browser's query cache. A route
 * that calls it must export a `clientLoader` and a `HydrateFallback`, which is
 * what keeps such routes out of the server render in the first place.
 */
export async function requireUser(request: Request, role: UserRole = "candidate") {
    const user = await getQueryClient().ensureQueryData({ ...meQuery(), revalidateIfStale: true });

    if (!user) throw redirect(getLoginPath(role), request);

    if (user.role !== role) throw redirect(getHomePath(user), request);

    // an account that never finished its setup is sent back into it
    const pathname = stripLocaleFromPathname(new URL(request.url).pathname);

    if (user.status === "created" && !pathname.startsWith(getSetupPrefix(user)))
        throw redirect(getSetupPath(user), request);

    return user;
}
