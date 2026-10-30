/**
 * Server-only API client used by route loaders.
 *
 * The `.server.ts` suffix keeps this module out of the browser bundle, which
 * matters for two reasons:
 *  - the URL can come from `process.env` at runtime instead of being inlined
 *    at build time, so a container image can point at an internal address
 *    (http://api:3000);
 *  - it handles the visitor's session cookies, which never reach client code.
 *
 * The API sets its auth cookies on the parent domain it shares with the site,
 * so the browser sends them here too. Loaders forward them, so a signed-in
 * visitor gets their personal fields (score / isSaved / isApplied) straight
 * from the server render. An expired access token is refreshed once per page
 * request, and the new cookie is handed back to the browser through the
 * loader's headers — see `sessionHeaders`.
 *
 * The API rejects requests whose `Origin` is not on its allowlist, and Node's
 * fetch never sends one, so it is set explicitly from the incoming request.
 * The API also picks which cookie pair to read from that `Origin`.
 */

/**
 * `API_URL` is read at runtime, so a container can point at an internal
 * address. It falls back to the build-time `VITE_API_URL` that the rest of the
 * app already uses, which is what makes `react-router dev` work with no extra
 * setup.
 */
const API_URL = process.env.API_URL ?? import.meta.env.VITE_API_URL;

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

export class ServerApiError extends Error {
    status: number;

    constructor(status: number, message?: string) {
        super(message ?? `Request failed with status ${status}`);
        this.name = "ServerApiError";
        this.status = status;
    }
}

/**
 * A loader runs before the render starts, so `entry.server.tsx`'s
 * `streamTimeout` does not cover it: without a limit here a hung API would
 * hold the whole page request open.
 */
const SERVER_API_TIMEOUT_MS = 5_000;

type Session = {
    /** the auth cookies still worth sending; emptied once they turn out to be dead */
    cookies: Map<string, string>;
    /** `Set-Cookie` lines from a refresh, for the browser */
    setCookies: string[];
};

/** per `Request` — which React Router creates anew for every loader of a page */
const sessions = new WeakMap<Request, Session>();

const parseCookies = (header: string | null) => {
    const cookies = new Map<string, string>();

    for (const part of (header ?? "").split(";")) {
        const eq = part.indexOf("=");

        if (eq === -1) continue;

        const name = part.slice(0, eq).trim();

        if (name === ACCESS_COOKIE || name === REFRESH_COOKIE) cookies.set(name, part.slice(eq + 1).trim());
    }

    return cookies;
};

const getSession = (request: Request) => {
    let session = sessions.get(request);

    if (!session) {
        session = { cookies: parseCookies(request.headers.get("Cookie")), setCookies: [] };
        sessions.set(request, session);
    }

    return session;
};

/** `true` when the request carries a session at all, whether or not it is still valid */
export const hasSessionCookie = (request: Request) => getSession(request).cookies.has(REFRESH_COOKIE);

/**
 * The `Set-Cookie` lines a refresh produced for this loader. The loader passes
 * them on through `data(..., { headers })`; React Router merges and
 * de-duplicates cookies from every loader of the page.
 */
export const sessionHeaders = (request: Request): [string, string][] =>
    getSession(request).setCookies.map((cookie) => ["Set-Cookie", cookie]);

const cookieHeader = (session: Session) =>
    [...session.cookies].map(([name, value]) => `${name}=${value}`).join("; ");

/**
 * The access token is a JWT, so its expiry can be read without the secret.
 * Nothing is trusted from it — the API still verifies the token — it only
 * saves a request that would come back 401. A token that cannot be read is
 * sent as is and left to the API to judge.
 */
const REFRESH_LEEWAY_S = 10;

const isExpired = (token: string) => {
    try {
        const { exp } = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString()) as {
            exp?: number;
        };

        return typeof exp === "number" && exp - REFRESH_LEEWAY_S < Date.now() / 1000;
    } catch {
        return false;
    }
};

/**
 * The `Origin` sent to the API. `SITE_URL` is the same value the SEO helpers
 * use, so the origin sent to the API and the one in canonical links cannot
 * drift apart. It is the escape hatch for deployments where the public origin
 * is not what reaches this process (a proxy that rewrites Host, for instance);
 * without it the incoming request's origin is already correct.
 *
 * Read from `process.env` rather than imported from `app/utils/seo.ts`: that
 * module falls back to a hardcoded production URL for the browser bundle, which
 * would have `react-router dev` send a production `Origin` the API rejects.
 * `new URL(...).origin` strips a trailing slash or a sub-path, neither
 * of which is a valid `Origin`.
 */
const originOf = (request: Request) => new URL(process.env.SITE_URL ?? request.url).origin;

/**
 * The visitor's address, as the proxy in front of this server recorded it
 * (Railway's edge sets it). Every loader request reaches the API from this
 * server's one address, so without it the API's per-IP rate limit would count
 * all visitors as one. `react-router-serve` exposes no socket address to
 * loaders, so with no proxy in front (local development) nothing is sent.
 */
const forwardedFor = (request: Request) => request.headers.get("X-Forwarded-For");

const send = (
    request: Request,
    path: string,
    init: RequestInit,
    signal: AbortSignal | null = request.signal,
) => {
    const cookies = cookieHeader(getSession(request));
    const clientIp = forwardedFor(request);

    return fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
            ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
            Origin: originOf(request),
            ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
            ...(cookies ? { Cookie: cookies } : {}),
            ...init.headers,
        },
        // also aborted when the visitor goes away mid-request
        signal: AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(SERVER_API_TIMEOUT_MS)]),
    });
};

type Refreshed = { access: string; setCookies: string[] } | null;

/**
 * Refreshes shared by refresh token. Every loader of a page needs the new
 * access token, and they run in parallel on requests of their own; keeping
 * the answer for a few seconds is what makes a page cost one refresh instead
 * of one per loader. Keyed by the token itself, so only its holder ever sees
 * the result.
 */
const REFRESH_REUSE_MS = 10_000;

const refreshes = new Map<string, Promise<Refreshed>>();

const doRefresh = async (request: Request, refreshToken: string): Promise<Refreshed> => {
    try {
        const response = await send(
            request,
            "/auth/refresh",
            { method: "POST", headers: { Cookie: `${REFRESH_COOKIE}=${refreshToken}` } },
            // shared with other loaders, so one visitor's abort must not cancel it for the rest
            null,
        );

        const setCookies = response.headers.getSetCookie();
        const access = parseCookies(setCookies.map((line) => line.split(";")[0]).join("; ")).get(
            ACCESS_COOKIE,
        );

        return response.ok && access ? { access, setCookies } : null;
    } catch {
        // a network failure is treated like a refused refresh: render anonymously
        return null;
    }
};

/**
 * Trades the refresh token for a new access token. On failure the session is
 * dropped from this request, so everything after it — including the retry —
 * goes out anonymously instead of failing again.
 */
const refresh = async (request: Request, session: Session) => {
    const token = session.cookies.get(REFRESH_COOKIE)!;

    let pending = refreshes.get(token);

    if (!pending) {
        pending = doRefresh(request, token);
        refreshes.set(token, pending);
        setTimeout(() => refreshes.delete(token), REFRESH_REUSE_MS).unref();
    }

    const refreshed = await pending;

    if (!refreshed) {
        session.cookies.clear();

        return;
    }

    session.cookies.set(ACCESS_COOKIE, refreshed.access);
    session.setCookies = refreshed.setCookies.map((line) => fitDomain(line, new URL(request.url).hostname));
};

/**
 * Drops a `Domain` the site's own host does not belong to — the browser would
 * reject the whole cookie otherwise. In production the API's domain covers the
 * site and nothing changes; on localhost against a remote API (see
 * vite.config.ts) the cookie becomes a localhost one, like the proxied ones.
 */
const fitDomain = (setCookie: string, host: string) =>
    setCookie.replace(/;\s*Domain=\.?([^;]+)/i, (attr, domain: string) =>
        host === domain.toLowerCase() || host.endsWith(`.${domain.toLowerCase()}`) ? attr : "",
    );

const serverRequest = async <T>(request: Request, path: string, init: RequestInit): Promise<T> => {
    if (!API_URL) throw new Error("API_URL (or VITE_API_URL) must be set for server-side requests");

    const session = getSession(request);
    const access = session.cookies.get(ACCESS_COOKIE);

    // the access token expires long before the refresh one, and without a
    // valid one the API answers 401 even on public endpoints — so refresh up
    // front rather than spend a request finding that out
    if (session.cookies.has(REFRESH_COOKIE) && (!access || isExpired(access)))
        await refresh(request, session);

    let response = await send(request, path, init);

    // revoked or otherwise rejected despite looking valid: one refresh, one retry
    if (response.status === 401 && session.cookies.has(REFRESH_COOKIE) && session.setCookies.length === 0) {
        await refresh(request, session);
        response = await send(request, path, init);
    }

    if (!response.ok) throw new ServerApiError(response.status, response.statusText);

    return (await response.json()) as T;
};

export const serverApi = (request: Request) => ({
    get: <T>(path: string) => serverRequest<T>(request, path, { method: "GET" }),
    post: <T>(path: string, body?: unknown) =>
        serverRequest<T>(request, path, { method: "POST", body: JSON.stringify(body) }),
});
