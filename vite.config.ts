import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv, type ProxyOptions } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

/**
 * Local development against a remote API. The auth cookies are
 * `SameSite=Lax` and scoped to the API's parent domain, so a browser on
 * localhost neither sends them cross-site nor passes them to the dev server.
 * With `VITE_API_URL` set to a path (`/api`) the browser talks to the dev
 * server instead, which forwards to `API_URL` and rewrites the cookies onto
 * localhost — first-party for the browser and visible to the server render.
 *
 * Dev server only: a production build keeps an absolute `VITE_API_URL`.
 */
const apiProxy = (env: Record<string, string>): Record<string, ProxyOptions> | undefined => {
    const prefix = env.VITE_API_URL;

    if (!prefix?.startsWith("/")) return undefined;

    if (!env.API_URL)
        throw new Error(`VITE_API_URL=${prefix} is proxied, so API_URL must point at the real API`);

    // loaders run in this process and need the absolute address, not the
    // prefix — `src/api/server.server.ts` reads it from here
    process.env.API_URL ??= env.API_URL;

    return {
        [prefix]: {
            target: env.API_URL,
            changeOrigin: true,
            rewrite: (path) => path.slice(prefix.length),
            // no Domain: the cookie belongs to whatever host served it
            cookieDomainRewrite: "",
            // same-origin GETs carry no `Origin`, and the API refuses a request without one
            headers: env.VITE_SITE_URL ? { Origin: new URL(env.VITE_SITE_URL).origin } : undefined,
        },
    };
};

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [
            reactRouter(),
            sentryVitePlugin({
                org: "drizzle-team",
                project: "ugs-fe",
                authToken: env.SENTRY_AUTH_TOKEN,
                sourcemaps: {
                    filesToDeleteAfterUpload: "./build/**/*.map",
                },
            }),
        ],
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
            },
        },
        server: {
            proxy: command === "serve" ? apiProxy(env) : undefined,
        },
        build: {
            sourcemap: true,
        },
    };
});
