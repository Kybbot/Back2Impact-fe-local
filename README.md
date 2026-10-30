# ugs-frontend

React Router 7 (framework mode) + React 19 + Vite 8.

## Rendering modes

| Route           | Mode | How it is wired                                                            |
| --------------- | ---- | -------------------------------------------------------------------------- |
| `/`             | SSG  | `prerender: ['/']` in `react-router.config.ts` → `build/client/index.html` |
| `/jobs/all`     | SSR  | server `loader` in `src/routes/jobs.all.tsx`                               |
| `/jobs/j/:id`   | SSR  | server `loader` + JSON-LD in `src/routes/job.tsx`                          |
| everything else | SPA  | `clientLoader` + `HydrateFallback`, no server `loader`                     |

A route that exports a `clientLoader` and a `HydrateFallback` but **no** server
`loader` is skipped during the server render — that is the per-route SPA
escape hatch used across `src/routes/`.

The two SSR loaders fetch **anonymously**: the HTML is identical for every
visitor and therefore cacheable. Personal fields (`score`, `isSaved`,
`isApplied`, `applyStatus`) are filled in on the client once the visitor turns
out to be signed in — see `SessionEffects` in `src/root.tsx`,
`src/hooks/use-default-jobs-infinite.ts` and `src/hooks/use-job.ts`.

## Auth

There is no auth context. The signed-in user **is** the `me` query
(`src/hooks/useCurrentUser.ts`): `UserData` when there is a session, `null`
when there is none, `undefined` while it has not been asked yet. Everything
else derives from it.

| Concern                       | Where                                                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| token refresh                 | `src/api/instance.ts` — one place, one in-flight refresh; a 401 replays the request after it, a failed refresh sets `me` to `null`. Auth endpoints opt out with `skipAuthRefresh` |
| login / sign-up / logout      | mutations in `src/hooks/use-auth-mutations.ts`; `onSuccess` loads or clears the `me` query before `mutateAsync` resolves, so a navigation right after finds the cache ready    |
| signed-in-only routes         | `requireUser` (`src/utils/require-user.ts`) in the route's `clientLoader`, answering from the cache; `useRequireUser` in the component catches the session ending while the page is open |
| query cache outside React     | `getQueryClient()` in `src/api/query-client.ts` — a singleton in the browser, a fresh client per request on the server                                                           |

A page's markup never depends on the user during SSR: the header renders its
account block only once `me` has resolved, and the server-rendered lists are
never unmounted while it loads.

## Scripts

```sh
pnpm dev        # dev server with HMR + SSR
pnpm build      # client + server bundles, prerenders /
pnpm start      # serve the production build
pnpm typecheck  # react-router typegen && tsc -b
pnpm lint
```

## Environment

Build time — inlined into the client bundle:

| Variable                                           | Purpose                                                                                                                                 |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL`                                     | API base URL used by the browser                                                                                                        |
| `VITE_SITE_URL`                                    | public origin of the site — canonical URLs, `og:url`, sitemap entries. `/` is prerendered at build time, so its canonical is fixed here |
| `VITE_SENTRY_DSN`, `VITE_APP_VERSION`, `VITE_MODE` | Sentry                                                                                                                                  |
| `SENTRY_AUTH_TOKEN`                                | source map upload; build stage only                                                                                                     |

Local development against a remote API: the auth cookies are scoped to the
API's parent domain and `SameSite=Lax`, so a browser on `localhost` would
neither send them to the API nor to the dev server. Set `VITE_API_URL` to a
path instead and `API_URL` to the real API — the dev server then proxies that
path and rewrites the cookies onto `localhost` (see `vite.config.ts`):

```
VITE_API_URL=/api
API_URL=https://api.ugs.railway.oleksii-drizzle-team.us
VITE_SITE_URL=http://localhost:5173
```

Google sign-in still does not work this way: its callback lands on the API's
own domain, which sets the cookies there.

Runtime — read by the SSR server:

| Variable     | Purpose                                                                                                                                                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`       | listen port (default 3000)                                                                                                                                                                                                                     |
| `API_URL`    | API base URL for loaders; falls back to `VITE_API_URL`. Set it when the server should reach the API over an internal address (`http://api:3000`)                                                                                               |
| `SITE_URL`   | public origin of the site, used for two things. It overrides the build-time `VITE_SITE_URL` on server-rendered pages — set both, to the same value, because `meta` runs on the server and again in the browser and a mismatch shows up as a hydration warning on the canonical link. It is also sent as the `Origin` header to the API, which rejects origins that are not on its allowlist (Node's `fetch` never sends one on its own); leave it unset and the incoming request's origin is used, which is correct unless a proxy rewrites `Host` |

## SEO

| Concern                                             | Where                                                                                                                                     |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| titles, descriptions, canonical, OpenGraph, Twitter | `seo()` in `src/utils/seo.ts`, called from each route's `meta`                                                                            |
| `robots.txt`, `sitemap.xml`                         | resource routes `src/routes/robots.ts` and `src/routes/sitemap.ts`                                                                        |
| structured data                                     | `Organization` + `WebSite` in `routes/home.tsx`, `ItemList` in `routes/jobs.all.tsx`, `JobPosting` + `BreadcrumbList` in `routes/job.tsx` |
| crawlable vacancy links                             | the `<h2>` of each card in `src/components/job/job.tsx`; the card's own click handler stays for visitors                                  |
| pagination                                          | `/jobs/all?page=N` is server-rendered, with a `rel="next"` anchor after the list. Visually hidden (infinite scroll is what a sighted visitor uses) but kept in the DOM, keyboard-reachable, and unhidden on focus |

React Router takes `meta` from the **deepest** matched route that exports one
and does not merge it with its parents, so every indexable route builds its
full set through `seo()`. `routes/guarded.tsx` exports a `noindex` `meta` that
covers all of `/onboarding` and `/profile` for the same reason.

Search and filters live in component state and never reach the URL, so there
are no filtered listing URLs that could be indexed as near-duplicates.

`routes/sitemap.ts` reads `GET /jobs/sitemap` (`{ id, lastEditedAt }[]`). Only
vacancies that answer 200 belong in that response — hidden and deleted ones are
expected to be filtered out by the API, since `routes/job.tsx` answers 404/410
for them and a sitemap must not list URLs that do. One file holds up to 50 000
URLs; past that the loader throws rather than truncate, and the fix is to split
it behind a `<sitemapindex>`.

**Not done, needs the API:** `validThrough` on `JobPosting` — without an expiry
date Google drops a vacancy from the jobs experience roughly a month after
`datePosted`.

## Docker

```sh
docker build \
  --build-arg VITE_API_URL=https://api.example.com \
  --build-arg VITE_SENTRY_DSN=... \
  -t ugs-frontend .

docker run -p 3000:3000 -e API_URL=http://api:3000 ugs-frontend
```
