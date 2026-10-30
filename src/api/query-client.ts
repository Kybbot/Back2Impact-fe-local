import { QueryClient } from "@tanstack/react-query";

const makeQueryClient = () =>
    new QueryClient({ defaultOptions: { queries: { staleTime: 60 * 1000, retry: false } } });

let browserQueryClient: QueryClient | undefined;

/**
 * On the server every call returns a fresh client: a module-level singleton
 * would share cache between different users' requests. `Root` keeps the one
 * it gets in `useState`, so a request still renders against a single client.
 *
 * In the browser there is one user and one cache, so the client is a
 * singleton — that is what lets `clientLoader`s and the http client reach the
 * same cache the components render from.
 */
export const getQueryClient = () => {
    if (typeof window === "undefined") return makeQueryClient();

    return (browserQueryClient ??= makeQueryClient());
};
