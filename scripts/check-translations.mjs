/**
 * Compares the key sets of every locale against the default one.
 *
 * `app/i18n/i18next.d.ts` derives the `t()` key types from the Ukrainian
 * files, so a typo in a key is already a compile error — but a key that exists
 * in `uk` and is missing from `en` is not: it silently falls back and the
 * English page renders Ukrainian text. That is what this catches.
 *
 * i18next plural and context suffixes are stripped before comparing, since the
 * two languages legitimately need different ones (`_one/_few/_many` in
 * Ukrainian, `_one/_other` in English).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const localesDir = join(here, "..", "app", "i18n", "locales");

// Mirrors app/i18n/config.ts. That file is TypeScript and this script runs on
// bare Node, so the lists are repeated rather than adding a transpile step for
// one check — keep them in step when a locale or namespace is added.
const locales = ["uk", "en"];
const defaultLocale = "uk";
const namespaces = [
    "common",
    "home",
    "auth",
    "jobs",
    "job",
    "onboarding",
    "profile",
    "employers",
    "options",
    "seo",
    "errors",
];

/** i18next resolves `key_one` / `key_other` / `key_range` from the base `key` */
const SUFFIX = /_(zero|one|two|few|many|other|[a-zA-Z0-9]+)$/;

/**
 * `{{count}}` and the `<signUp>…</signUp>` / `<br/>` tags a `Trans` maps onto
 * React elements. Dropping one in translation does not fail a key check but
 * does break the rendered sentence, so they are compared too.
 */
const PLACEHOLDERS = /\{\{\s*([a-zA-Z0-9_]+)[^}]*\}\}|<\/?([a-zA-Z][a-zA-Z0-9]*)\s*\/?>/g;

const placeholdersIn = (text) =>
    new Set([...text.matchAll(PLACEHOLDERS)].map((m) => m[1] ?? m[2]));

const flatten = (value, prefix = "", out = new Map()) => {
    for (const [key, child] of Object.entries(value)) {
        const path = prefix ? `${prefix}.${key}` : key;

        if (child && typeof child === "object") flatten(child, path, out);
        else {
            const base = path.replace(SUFFIX, "");
            // plural variants of one key share a placeholder set; union them
            const existing = out.get(base) ?? new Set();

            for (const name of placeholdersIn(String(child))) existing.add(name);
            out.set(base, existing);
        }
    }

    return out;
};

const read = (locale, ns) =>
    flatten(JSON.parse(readFileSync(join(localesDir, locale, `${ns}.json`), "utf8")));

let failed = false;

for (const ns of namespaces) {
    const expected = read(defaultLocale, ns);

    for (const locale of locales) {
        if (locale === defaultLocale) continue;

        const actual = read(locale, ns);

        for (const key of expected.keys()) {
            if (!actual.has(key)) {
                failed = true;
                console.error(`missing  ${locale}/${ns}.json  ${key}`);
                continue;
            }

            const want = expected.get(key);
            const got = actual.get(key);
            const lost = [...want].filter((name) => !got.has(name));
            const added = [...got].filter((name) => !want.has(name));

            if (lost.length || added.length) {
                failed = true;
                console.error(
                    `placeholders ${locale}/${ns}.json  ${key}` +
                        (lost.length ? `  missing: ${lost.join(", ")}` : "") +
                        (added.length ? `  unexpected: ${added.join(", ")}` : ""),
                );
            }
        }

        for (const key of actual.keys()) {
            if (!expected.has(key)) {
                failed = true;
                console.error(`orphan   ${locale}/${ns}.json  ${key}  (not in ${defaultLocale})`);
            }
        }
    }
}

if (failed) {
    console.error("\nTranslation keys are out of sync.");
    process.exit(1);
}

console.log(`Translations in sync across ${locales.join(", ")}.`);
