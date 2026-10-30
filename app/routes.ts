import {
    index,
    route,
    layout,
    prefix,
    type RouteConfig,
    type RouteConfigEntry,
} from "@react-router/dev/routes";

import { NON_DEFAULT_LOCALES } from "./i18n/config";

/**
 * The whole app is mounted once per locale: the default (Ukrainian) at the
 * root, every other locale behind its own path prefix — `/jobs/all` and
 * `/en/jobs/all` are the same route files rendered in two languages.
 *
 * Because each file is mounted more than once, every entry needs an explicit
 * `id`: React Router derives ids from the file path and would otherwise see
 * duplicates. `idPrefix` is empty for the default locale, so the ids of the
 * existing routes — and therefore any `useRouteLoaderData` caller — stay
 * exactly what they were.
 */
const localizedRoutes = (idPrefix = ""): RouteConfigEntry[] => [
    // SSG — prerendered at build time (see react-router.config.ts)
    index("routes/home.tsx", { id: `${idPrefix}routes/home` }),

    // SPA
    route("auth", "routes/auth.tsx", { id: `${idPrefix}routes/auth` }),
    route("verify-email", "routes/verify-email.tsx", { id: `${idPrefix}routes/verify-email` }),
    route("reset-password", "routes/reset-password.tsx", { id: `${idPrefix}routes/reset-password` }),
    route("employers/auth", "routes/employers.auth.tsx", { id: `${idPrefix}routes/employers.auth` }),

    // public branch: Layout + AppHeader
    layout("routes/app-layout.tsx", { id: `${idPrefix}routes/app-layout` }, [
        route("jobs", "routes/jobs.tsx", { id: `${idPrefix}routes/jobs` }, [
            index("routes/jobs.index.tsx", { id: `${idPrefix}routes/jobs.index` }),
            route("all", "routes/jobs.all.tsx", { id: `${idPrefix}routes/jobs.all` }), // SSR
            route("for-you", "routes/jobs.for-you.tsx", { id: `${idPrefix}routes/jobs.for-you` }),
            route("saved", "routes/jobs.saved.tsx", { id: `${idPrefix}routes/jobs.saved` }),
            route("applied", "routes/jobs.applied.tsx", { id: `${idPrefix}routes/jobs.applied` }),
            route("*", "routes/jobs.catch-all.tsx", { id: `${idPrefix}routes/jobs.catch-all` }),
        ]),
        route("jobs/j/:id", "routes/job.tsx", { id: `${idPrefix}routes/job` }), // SSR
    ]),

    // authorized-only branch, SPA throughout
    layout("routes/guarded.tsx", { id: `${idPrefix}routes/guarded` }, [
        route("onboarding", "routes/onboarding.tsx", { id: `${idPrefix}routes/onboarding` }, [
            route("about-you", "routes/onboarding.about-you.tsx", {
                id: `${idPrefix}routes/onboarding.about-you`,
            }),
            route("looking-for", "routes/onboarding.looking-for.tsx", {
                id: `${idPrefix}routes/onboarding.looking-for`,
            }),
            route("sectors", "routes/onboarding.sectors.tsx", {
                id: `${idPrefix}routes/onboarding.sectors`,
            }),
            route("professions", "routes/onboarding.professions.tsx", {
                id: `${idPrefix}routes/onboarding.professions`,
            }),
            route("location", "routes/onboarding.location.tsx", {
                id: `${idPrefix}routes/onboarding.location`,
            }),
            route("work-location", "routes/onboarding.work-location.tsx", {
                id: `${idPrefix}routes/onboarding.work-location`,
            }),
            route("cv", "routes/onboarding.cv.tsx", { id: `${idPrefix}routes/onboarding.cv` }),
            route("done", "routes/onboarding.done.tsx", {
                id: `${idPrefix}routes/onboarding.done`,
            }),
        ]),
        route("profile", "routes/profile.tsx", { id: `${idPrefix}routes/profile` }, [
            route("about-me", "routes/profile.about-me.tsx", {
                id: `${idPrefix}routes/profile.about-me`,
            }),
            route("experience", "routes/profile.experience.tsx", {
                id: `${idPrefix}routes/profile.experience`,
            }),
            route("documents", "routes/profile.documents.tsx", {
                id: `${idPrefix}routes/profile.documents`,
            }),
            route("settings", "routes/profile.settings.tsx", {
                id: `${idPrefix}routes/profile.settings`,
            }),
        ]),
    ]),

    // employer cabinet, authorized-only, SPA throughout
    layout("routes/employers-guarded.tsx", { id: `${idPrefix}routes/employers-guarded` }, [
        route("employers/setup", "routes/employers.setup.tsx", { id: `${idPrefix}routes/employers.setup` }),
        // the cabinet proper: header + side navigation, see EmployerLayout
        layout("routes/employers-layout.tsx", { id: `${idPrefix}routes/employers-layout` }, [
            route("employers/dashboard", "routes/employers.dashboard.tsx", {
                id: `${idPrefix}routes/employers.dashboard`,
            }),
            route("employers/vacancies", "routes/employers.vacancies.tsx", {
                id: `${idPrefix}routes/employers.vacancies`,
            }),
            route("employers/candidates", "routes/employers.candidates.tsx", {
                id: `${idPrefix}routes/employers.candidates`,
            }),
            route("employers/settings", "routes/employers.settings.tsx", {
                id: `${idPrefix}routes/employers.settings`,
            }),
        ]),
    ]),
];

export default [
    ...localizedRoutes(),

    ...NON_DEFAULT_LOCALES.flatMap((locale) => prefix(locale, localizedRoutes(`${locale}/`))),

    // resource routes: a loader returning a Response, no component. They are
    // generated per request because both need the public origin and the
    // sitemap needs the live list of vacancies. Neither is localized — a single
    // robots.txt and a single sitemap.xml cover every locale.
    route("robots.txt", "routes/robots.ts"),
    route("sitemap.xml", "routes/sitemap.ts"),
] satisfies RouteConfig;
