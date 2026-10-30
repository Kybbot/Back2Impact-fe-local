/**
 * The browser-side API client. Every request to the API goes through here so
 * that session handling lives in exactly one place:
 *
 *  - a 401 means the access token has expired: the client refreshes it once
 *    (concurrent callers share the same refresh) and replays the request;
 *  - a refresh that fails is the end of the session: the `me` query is set to
 *    `null`, and everything that depends on it — the header, the guards —
 *    reacts on its own;
 *  - auth endpoints opt out with `skipAuthRefresh`: a 401 from `/auth/login`
 *    is the answer, not an expired session.
 *
 * Not for the server: loaders use `server.server.ts`, which forwards the
 * visitor's cookies itself and reads its URL from `process.env`.
 */
import { ApiError } from "../errors/api-error";
import { getQueryClient } from "./query-client";
import { queryKeys } from "./query-keys";

const BASE_URL = import.meta.env.VITE_API_URL as string;

type ParamValue = string | number | boolean | Array<string | number> | null | undefined;

export type Params = Record<string, ParamValue>;

export const serializeParams = (params: Params) => {
    const qs = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined) continue;

        qs.set(key, Array.isArray(value) ? value.join(",") : String(value));
    }

    return qs.toString();
};

export type RequestOptions = {
    params?: Params;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    /** for auth endpoints, where a 401 is a real answer rather than an expired token */
    skipAuthRefresh?: boolean;
};

type Init = RequestOptions & { method: string; body?: unknown };

let refreshing: Promise<boolean> | null = null;

/** one refresh at a time: concurrent 401s all wait for the same round trip */
export const refreshSession = (): Promise<boolean> =>
    (refreshing ??= fetch(`${BASE_URL}/auth/refresh`, { method: "POST", credentials: "include" })
        .then((res) => res.ok)
        .catch(() => false)
        .finally(() => {
            refreshing = null;
        }));

const send = (url: string, { method, body, headers, signal }: Init) =>
    fetch(url, {
        method,
        credentials: "include",
        signal,
        // the JSON content type only when there is a body: on a bodiless GET it
        // would turn a simple cross-origin request into a preflighted one
        headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

/** the raw `Response` for callers that stream; everything else wants `json` below */
export const apiFetch = async (path: string, init: Init): Promise<Response> => {
    const qs = init.params ? serializeParams(init.params) : "";
    const url = `${BASE_URL}${path}${qs ? `?${qs}` : ""}`;

    let response = await send(url, init);

    if (response.status === 401 && !init.skipAuthRefresh) {
        if (await refreshSession()) response = await send(url, init);
        else getQueryClient().setQueryData(queryKeys.me, null);
    }

    if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;

        throw new ApiError(response.status, data?.message);
    }

    return response;
};

const json = async <T>(path: string, init: Init): Promise<T> => {
    const response = await apiFetch(path, init);
    const text = await response.text();

    // 204s and empty bodies resolve to `undefined` instead of throwing on parse
    return (text ? JSON.parse(text) : undefined) as T;
};

const instance = {
    get: <T = unknown>(path: string, options?: RequestOptions) =>
        json<T>(path, { ...options, method: "GET" }),

    post: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
        json<T>(path, { ...options, method: "POST", body }),

    put: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
        json<T>(path, { ...options, method: "PUT", body }),

    patch: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
        json<T>(path, { ...options, method: "PATCH", body }),

    delete: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
        json<T>(path, { ...options, method: "DELETE", body }),

    stream: (path: string, body?: unknown, options?: RequestOptions) =>
        apiFetch(path, { ...options, method: "POST", body }),
};

export default instance;
