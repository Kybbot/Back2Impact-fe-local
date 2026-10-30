import { useState } from "react";
import { data } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import Layout from "../layouts/AppLayout/layout";
import useOnboardingRedirect from "../hooks/use-onboarding-redirect";
import { useRequireRole } from "../hooks/use-require-user";
import { seedCurrentUser } from "../hooks/useCurrentUser";
import { getQueryClient } from "../api/query-client";
import { queryKeys } from "../api/query-keys";
import { ServerApiError, hasSessionCookie, serverApi, sessionHeaders } from "../api/server.server";
import { redirect } from "../i18n/navigation";
import { PRIVATE_CACHE_CONTROL } from "../utils/cache-headers";
import { getHomePath } from "../utils/home-path";
import type { UserData } from "../services/user-service/types";
import type { Route } from "./+types/app-layout";

/**
 * Where a signed-in visitor goes instead of this subtree, or `null` to stay:
 * the /jobs pages are the candidate's side, so an employer is sent to their
 * cabinet, and an account that never finished its setup back into it.
 */
const redirectPath = (me: UserData | null | undefined) =>
    me && (me.role !== "candidate" || me.status === "created") ? getHomePath(me) : null;

/**
 * The signed-in user, for the server render of the public /jobs subtree.
 *
 * `null` is "nobody"; `undefined` means the server could not tell (the API
 * failed), in which case nothing is seeded and the client asks on its own.
 * A visitor with no session cookie costs no request at all.
 *
 * An employer, or an account that never finished its setup, is redirected
 * from here, before anything renders — see `redirectPath`.
 */
export async function loader({ request }: Route.LoaderArgs) {
    if (!hasSessionCookie(request)) return data({ me: null as UserData | null | undefined });

    let me: UserData | null | undefined;

    try {
        me = await serverApi(request).get<UserData>("/user/me");
    } catch (error) {
        me = error instanceof ServerApiError && error.status === 401 ? null : undefined;
    }

    const headers: [string, string][] = [
        ...sessionHeaders(request),
        ["Cache-Control", PRIVATE_CACHE_CONTROL],
    ];

    const path = redirectPath(me);

    // the redirect carries the refreshed cookies too, or the browser would
    // keep a session the API has already rotated
    if (path) throw redirect(path, request, { headers });

    return data({ me }, { headers });
}

/**
 * Client-side navigations into the subtree: the browser's cache already knows
 * the user once anything has asked, so the server is only consulted when
 * nothing has. Not run on hydration — the server's answer is used as is.
 */
export async function clientLoader({ request, serverLoader }: Route.ClientLoaderArgs) {
    const me = getQueryClient().getQueryData<UserData | null>(queryKeys.me);

    if (me === undefined) return serverLoader();

    const path = redirectPath(me);

    if (path) throw redirect(path, request);

    return { me };
}

/** the pages below read the decision back through `parentHeaders`, see utils/cache-headers.ts */
export function headers({ loaderHeaders }: Route.HeadersArgs) {
    const cacheControl = loaderHeaders.get("Cache-Control");

    return cacheControl ? { "Cache-Control": cacheControl } : new Headers();
}

/**
 * Only the first render needs this: from then on the `me` query in the
 * browser's cache is the source of truth, kept current by the auth mutations
 * and the http client.
 */
export function shouldRevalidate() {
    return false;
}

/**
 * Pathless layout around the public /jobs subtree (AppHeader + Outlet).
 * Server-renderable: nothing here touches the DOM during render.
 */
export default function AppLayoutRoute({ loaderData }: Route.ComponentProps) {
    const queryClient = useQueryClient();

    // during render, before anything below reads `me`: the server and the
    // hydrating client both render with the user the loader found
    useState(() => {
        if (loaderData.me !== undefined) seedCurrentUser(queryClient, loaderData.me);
    });

    // the loaders redirect on the way in; these cover what they cannot see
    useRequireRole("candidate");
    useOnboardingRedirect();

    return <Layout className="app__layout" userKnown={loaderData.me !== undefined} />;
}
