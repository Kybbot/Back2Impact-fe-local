import { PassThrough } from "node:stream";

import { createInstance } from "i18next";
import { isbot } from "isbot";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";

import type { AppLoadContext, EntryContext } from "react-router";
import type { RenderToPipeableStreamOptions } from "react-dom/server";

import { i18nConfig } from "./i18n/config";
import { getLocaleFromPathname } from "./i18n/locale";
import { resources } from "./i18n/resources";

export const streamTimeout = 5_000;

export default async function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    routerContext: EntryContext,
    _loadContext: AppLoadContext,
) {
    // https://httpwg.org/specs/rfc9110.html#HEAD
    if (request.method.toUpperCase() === "HEAD") {
        return new Response(null, {
            status: responseStatusCode,
            headers: responseHeaders,
        });
    }

    /**
     * A fresh i18next per request, for the same reason `QueryClient` is built
     * per request in `src/root.tsx`: a module-level singleton is shared by
     * every concurrent render, so one visitor on /en would flip the language
     * out from under another mid-render. `createInstance` is cheap — the
     * translations themselves are a module-level constant and are only
     * referenced, not copied.
     */
    const i18n = createInstance();

    await i18n.use(initReactI18next).init({
        ...i18nConfig,
        resources,
        // the URL is the only thing that decides the language, exactly as it is
        // on the client — see src/i18n/locale.ts
        lng: getLocaleFromPathname(new URL(request.url).pathname),
    });

    return new Promise((resolve, reject) => {
        let shellRendered = false;
        const userAgent = request.headers.get("user-agent");

        // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
        // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
        const readyOption: keyof RenderToPipeableStreamOptions =
            (userAgent && isbot(userAgent)) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";

        // Abort the rendering stream after the `streamTimeout` so it has time to
        // flush down the rejected boundaries
        let timeoutId: ReturnType<typeof setTimeout> | undefined = setTimeout(
            () => abort(),
            streamTimeout + 1000,
        );

        const { pipe, abort } = renderToPipeableStream(
            <I18nextProvider i18n={i18n}>
                <ServerRouter context={routerContext} url={request.url} />
            </I18nextProvider>,
            {
                [readyOption]() {
                    shellRendered = true;
                    const body = new PassThrough({
                        final(callback) {
                            // Clear the timeout to prevent retaining the closure and memory leak
                            clearTimeout(timeoutId);
                            timeoutId = undefined;
                            callback();
                        },
                    });
                    const stream = createReadableStreamFromReadable(body);

                    responseHeaders.set("Content-Type", "text/html");

                    pipe(body);

                    resolve(
                        new Response(stream, {
                            headers: responseHeaders,
                            status: responseStatusCode,
                        }),
                    );
                },
                onShellError(error: unknown) {
                    reject(error);
                },
                onError(error: unknown) {
                    responseStatusCode = 500;
                    // Log streaming rendering errors from inside the shell.  Don't log
                    // errors encountered during initial shell rendering since they'll
                    // reject and get logged in handleDocumentRequest.
                    if (shellRendered) {
                        console.error(error);
                    }
                },
            },
        );
    });
}
