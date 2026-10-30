/**
 * A page rendered for a signed-in visitor carries their personal fields, so
 * no shared cache may keep it. `routes/app-layout.tsx` decides from the
 * request's cookies and sets this; the pages below it read it back from
 * `parentHeaders`, since a `headers` export cannot see the request itself.
 */
export const PRIVATE_CACHE_CONTROL = "private, no-store";

/**
 * For a server-rendered page under the app layout: `publicValue` for an
 * anonymous visitor, private for a signed-in one. `Vary: Cookie` tells a
 * cache that honours it that the two are different documents; a CDN that
 * ignores `Vary` still needs a rule to bypass the cache on the session cookie.
 */
export const pageCacheHeaders = (parentHeaders: Headers, publicValue: string) => ({
    "Cache-Control":
        parentHeaders.get("Cache-Control") === PRIVATE_CACHE_CONTROL ? PRIVATE_CACHE_CONTROL : publicValue,
    Vary: "Cookie",
});
