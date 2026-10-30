import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` during the server render and the hydrating render, `true` from the
 * first client render after that. For markup that depends on browser-only
 * state — the query cache, which a `clientLoader` may have filled before
 * hydration — so the first client render still matches the server's HTML.
 */
export const useHydrated = () =>
    useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );
