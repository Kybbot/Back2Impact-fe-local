import { type Locale, type Namespace } from "./config";

import ukCommon from "./locales/uk/common.json";
import ukHome from "./locales/uk/home.json";
import ukAuth from "./locales/uk/auth.json";
import ukJobs from "./locales/uk/jobs.json";
import ukJob from "./locales/uk/job.json";
import ukOnboarding from "./locales/uk/onboarding.json";
import ukProfile from "./locales/uk/profile.json";
import ukEmployers from "./locales/uk/employers.json";
import ukOptions from "./locales/uk/options.json";
import ukSeo from "./locales/uk/seo.json";
import ukErrors from "./locales/uk/errors.json";

import enCommon from "./locales/en/common.json";
import enHome from "./locales/en/home.json";
import enAuth from "./locales/en/auth.json";
import enJobs from "./locales/en/jobs.json";
import enJob from "./locales/en/job.json";
import enOnboarding from "./locales/en/onboarding.json";
import enProfile from "./locales/en/profile.json";
import enEmployers from "./locales/en/employers.json";
import enOptions from "./locales/en/options.json";
import enSeo from "./locales/en/seo.json";
import enErrors from "./locales/en/errors.json";

/**
 * Every translation, bundled at build time rather than fetched at runtime.
 *
 * The obvious alternative — JSON under `public/` behind i18next's http/fs
 * backends — was tried and dropped for three reasons:
 *  - the runtime image copies only `build/`, where Vite has moved `public/`
 *    to `build/client/`, so a filesystem `loadPath` needs a different value in
 *    dev, in the prerender step and in Docker;
 *  - files in `public/` carry no content hash, so a cached copy of a namespace
 *    can outlive the deploy that changed it;
 *  - fetching a namespace on the client is a round trip in front of hydration.
 *
 * The cost is that a visitor downloads both languages. At the current size
 * (tens of kilobytes before compression) that is far cheaper than the round
 * trip. If the translations ever grow past a couple hundred kilobytes, split
 * this module by locale and `import()` the active one in `entry.client.tsx` —
 * every other file here keeps working unchanged.
 */
export const resources: Record<Locale, Record<Namespace, Record<string, unknown>>> = {
    uk: {
        common: ukCommon,
        home: ukHome,
        auth: ukAuth,
        jobs: ukJobs,
        job: ukJob,
        onboarding: ukOnboarding,
        profile: ukProfile,
        employers: ukEmployers,
        options: ukOptions,
        seo: ukSeo,
        errors: ukErrors,
    },
    en: {
        common: enCommon,
        home: enHome,
        auth: enAuth,
        jobs: enJobs,
        job: enJob,
        onboarding: enOnboarding,
        profile: enProfile,
        employers: enEmployers,
        options: enOptions,
        seo: enSeo,
        errors: enErrors,
    },
};
