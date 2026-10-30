import type common from "./locales/uk/common.json";
import type home from "./locales/uk/home.json";
import type auth from "./locales/uk/auth.json";
import type jobs from "./locales/uk/jobs.json";
import type job from "./locales/uk/job.json";
import type onboarding from "./locales/uk/onboarding.json";
import type profile from "./locales/uk/profile.json";
import type employers from "./locales/uk/employers.json";
import type options from "./locales/uk/options.json";
import type seo from "./locales/uk/seo.json";
import type errors from "./locales/uk/errors.json";

/**
 * Types the key argument of every `t()` call, so a typo or a key removed from
 * the dictionaries is a compile error rather than a string that renders as
 * itself in production.
 *
 * The shape is taken from the Ukrainian files because Ukrainian is the source
 * of truth for what keys exist. That means a key present in `uk` but missing
 * from `en` is *not* caught here — `scripts/check-translations.mjs` compares
 * the two sets and is what the build runs for that.
 */
declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: "common";
        resources: {
            common: typeof common;
            home: typeof home;
            auth: typeof auth;
            jobs: typeof jobs;
            job: typeof job;
            onboarding: typeof onboarding;
            profile: typeof profile;
            employers: typeof employers;
            options: typeof options;
            seo: typeof seo;
            errors: typeof errors;
        };
    }
}
