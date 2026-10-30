import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query";

import { queryKeys } from "../api/query-keys";
import { ApiError } from "../errors/api-error";
import userService from "../services/user-service/user-service";
import type { UserData } from "../services/user-service/types";

/**
 * The one query that decides whether there is a signed-in user. `null` is a
 * real answer ("nobody"), `undefined` means it has not been asked yet.
 *
 * A 401 is turned into `null` here, but only after the http client has already
 * tried to refresh the token — so `null` means the session is really gone.
 *
 * Used both through `useCurrentUser` in components and directly by the
 * `clientLoader` guards through `ensureQueryData`, which is why it is a
 * `queryOptions` object rather than a bare hook.
 */
export const meQuery = () =>
    queryOptions({
        queryKey: queryKeys.me,
        queryFn: async (): Promise<UserData | null> => {
            try {
                return await userService.getMe();
            } catch (e) {
                if (e instanceof ApiError && e.status === 401) return null;

                throw e;
            }
        },
        // re-checked on window focus once this is over, which is how a logout
        // in another tab gets noticed
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

/** clients whose `me` came from the server render, see `seedCurrentUser` */
const serverSeeded = new WeakSet<QueryClient>();

/**
 * Puts the user the server rendered with into the cache, so the first client
 * render matches the HTML. Never overwrites: on a client-side navigation the
 * cache already holds the answer, and it is the more recent one.
 */
export const seedCurrentUser = (queryClient: QueryClient, user: UserData | null) => {
    if (queryClient.getQueryData(queryKeys.me) !== undefined) return;

    queryClient.setQueryData(queryKeys.me, user);
    serverSeeded.add(queryClient);
};

/**
 * `true` when `me` was known to the server render — and therefore so was
 * everything personal rendered alongside it (score / isSaved / isApplied).
 */
export const isServerSeeded = (queryClient: QueryClient) => serverSeeded.has(queryClient);

export default function useCurrentUser() {
    return useQuery(meQuery());
}

/** `false` while the user is still unknown, so anonymous UI is what renders first */
export const useIsLoggedIn = () => !!useCurrentUser().data;
