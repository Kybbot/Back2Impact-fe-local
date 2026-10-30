import { useEffect, useRef, useState } from "react";
import * as Sentry from "@sentry/react";
import { Slide, ToastContainer, type IconProps } from "react-toastify";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLocation,
} from "react-router";

import { LOCALE_TAGS } from "./i18n/config";
import { useLocale } from "./i18n/use-locale";
import { useSyncLocale, useT } from "./i18n/use-t";
import { stripLocaleFromPathname } from "./i18n/locale";
import { localeFromLocation, metaT } from "./i18n/i18n.static";
import { STORED_TO_LOCALE } from "./i18n/stored-language";
import { LOCALE_BOOTSTRAP, rememberLocale } from "./i18n/locale-cookie";

import { getQueryClient } from "./api/query-client";
import { queryKeys } from "./api/query-keys";
import useCurrentUser, { isServerSeeded } from "./hooks/useCurrentUser";
import NotFoundBlock from "./pages/404/NotFound";
import { SITE_NAME } from "./utils/seo";

import type { Route } from "./+types/root";

import "./assets/styles/index.css";

import successIcon from "/img/success-icon.svg";
import alertIcon from "/img/alert-icon.svg";

/** origin of the API the browser talks to, for an early connection */
const apiOrigin = (() => {
    try {
        return new URL(import.meta.env.VITE_API_URL as string).origin;
    } catch {
        return null;
    }
})();

/**
 * Fallback for routes that export no `meta` of their own — in practice only
 * what the ErrorBoundary below renders. React Router does not merge a parent's
 * descriptors into a child's, so every real page builds its own full set
 * through `seo()` in app/utils/seo.ts.
 *
 * Deliberately no canonical here: this also covers 404s, and pointing every
 * unknown URL's canonical at the homepage is worse than having none.
 *
 * `error` is set when the ErrorBoundary below is what renders. The 404 status
 * is already what keeps the page out of the index — `noindex` is here for the
 * case where something links to a URL that used to exist and a crawler reaches
 * the page before it reads the status.
 */
export const meta: Route.MetaFunction = ({ error, location }) => {
    // `meta` runs outside React, so it cannot reach the request-scoped i18next
    // through context; `metaT` is the read-only instance kept for exactly this
    const t = metaT(localeFromLocation(location), "seo");

    if (error)
        return [
            {
                title:
                    isRouteErrorResponse(error) && error.status === 404
                        ? t("error.notFound.title", { site: SITE_NAME })
                        : t("error.generic.title", { site: SITE_NAME }),
            },
            { name: "robots", content: "noindex" },
        ];

    return [
        { title: t("fallback.title", { site: SITE_NAME }) },
        { name: "description", content: t("fallback.description") },
    ];
};

export function Layout({ children }: { children: React.ReactNode }) {
    // the locale comes from the matched path, so the attribute is right on the
    // first server render and cannot drift from what the page is written in
    const locale = useLocale();

    return (
        <html lang={LOCALE_TAGS[locale]}>
            <head>
                <meta charSet="UTF-8" />

                {/*
                 * Before anything is fetched or painted: sends a visitor who
                 * has picked a language before to that language's URL. See
                 * app/i18n/locale-cookie.ts for why this is a script rather
                 * than a redirect in a loader.
                 */}
                <script dangerouslySetInnerHTML={{ __html: LOCALE_BOOTSTRAP }} />

                <meta name="theme-color" content="#ffffff" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />

                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                {apiOrigin && <link rel="preconnect" href={apiOrigin} crossOrigin="anonymous" />}
                <link
                    as="font"
                    rel="preload"
                    type="font/woff2"
                    crossOrigin="anonymous"
                    href="/fonts/FixelText/FixelText-Regular.woff2"
                />
                <link
                    as="font"
                    rel="preload"
                    type="font/woff2"
                    crossOrigin="anonymous"
                    href="/fonts/FixelText/FixelText-Medium.woff2"
                />

                <Meta />
                <Links />
            </head>
            <body>
                {children}

                {/* radix portals mount here, see app/utils/portal-container.ts */}
                <div id="portal"></div>

                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

/** the same icons as SuccessToast and ErrorBlock; other types go without */
const TOAST_ICONS: Partial<Record<IconProps["type"], string>> = {
    success: successIcon,
    error: alertIcon,
};

function toastIcon({ type }: IconProps) {
    const src = TOAST_ICONS[type];

    return src ? <img src={src} alt="" aria-hidden="true" /> : null;
}

/**
 * What used to be AuthProvider. The signed-in user is the `me` query and
 * nothing else; this only reacts to it.
 */
function SessionEffects() {
    const queryClient = useQueryClient();
    const { data: user } = useCurrentUser();
    const userId = user?.id;
    const email = user?.email;
    const language = user?.language;

    useEffect(() => {
        Sentry.setUser(email ? { email } : null);
    }, [email]);

    // the account carries the preference across devices, the cookie is what the
    // bootstrap script in `Layout` can read on the next entry — so mirror one
    // into the other. Only writes: a switch made here has already updated both.
    useEffect(() => {
        if (language) rememberLocale(STORED_TO_LOCALE[language]);
    }, [language]);

    // the vacancy lists carry personal fields (score / isSaved / isApplied), so
    // they are refetched when the user they were fetched for changes. Keyed on
    // the id: a plain refetch of `me` must not trigger it again. The first
    // answer only counts as a change when the server render did not already
    // know it — a page it rendered for the user is already theirs.
    const previousUserId = useRef<string | null | undefined>(undefined);

    useEffect(() => {
        const previous = previousUserId.current;

        previousUserId.current = userId ?? (user === null ? null : undefined);

        if (!userId || userId === previous) return;
        if (previous === undefined && isServerSeeded(queryClient)) return;

        queryClient.invalidateQueries({ queryKey: queryKeys.defaultJobs });
        queryClient.invalidateQueries({ queryKey: queryKeys.job });
    }, [userId, user, queryClient]);

    return null;
}

export default function Root() {
    // held in state so the server, where `getQueryClient` returns a fresh
    // client every time, renders a request against a single one
    const [queryClient] = useState(getQueryClient);

    const { t } = useT("errors");

    // rendering is already pinned to the URL's locale by `useT`; this only
    // keeps `i18n.language` itself from lagging behind a language switch
    useSyncLocale();

    return (
        <div id="root">
            <div className="app">
                <Sentry.ErrorBoundary fallback={<div>{t("generic.reload")}</div>}>
                    <QueryClientProvider client={queryClient}>
                        <SessionEffects />
                        <Outlet />
                        <ReactQueryDevtools initialIsOpen={false} />
                    </QueryClientProvider>
                </Sentry.ErrorBoundary>
                <ToastContainer
                    transition={Slide}
                    position="top-right"
                    autoClose={3000}
                    closeOnClick
                    pauseOnHover
                    hideProgressBar
                    theme="light"
                    icon={toastIcon}
                    toastClassName="toast"
                />
            </div>
        </div>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    const { pathname } = useLocation();
    const { t } = useT("errors");

    let status: number | undefined;
    let heading = t("generic.short");
    let description = t("page.generic.description");

    if (isRouteErrorResponse(error)) {
        status = error.status;

        if (error.status === 404 || error.status === 410) {
            heading = t("page.notFound.heading");
            // most 404s here are dead vacancy links, but the hint is only true
            // when the URL actually was one. The locale prefix is stripped
            // first so /en/jobs/j/123 gets the same treatment as /jobs/j/123
            description = stripLocaleFromPathname(pathname).startsWith("/jobs/j/")
                ? t("page.notFound.vacancyGone")
                : t("page.notFound.description");
        }
        // `statusText` is deliberately not read: it carries whatever English
        // string the thrower passed to `new Response(...)` ("Upstream error"),
        // which would reach the reader untranslated. The generic copy above is
        // both localised and more useful to them.
    }

    return (
        <div className="app">
            <NotFoundBlock status={status} heading={heading} description={description} />
        </div>
    );
}
