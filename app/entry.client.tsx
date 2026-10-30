import { startTransition, StrictMode } from "react";
import * as Sentry from "@sentry/react";
import i18next from "i18next";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { HydratedRouter } from "react-router/dom";

import { i18nConfig } from "./i18n/config";
import { getLocaleFromPathname } from "./i18n/locale";
import { resources } from "./i18n/resources";

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    release: import.meta.env.VITE_APP_VERSION,
    environment: import.meta.env.VITE_MODE,
    tracesSampleRate: 1.0,
});

/**
 * i18next is initialised *before* `hydrateRoot`, not inside a component.
 *
 * The server rendered the markup with a language already resolved; if the
 * first client render ran against an empty i18next it would produce raw keys,
 * React would see a mismatch on every translated string and throw the whole
 * server HTML away. `init` resolves synchronously here — the translations are
 * bundled, so there is nothing to fetch — but it is awaited anyway rather than
 * relying on that.
 *
 * The locale is read from the pathname with the same helper the server used,
 * so both sides cannot disagree.
 */
i18next
    .use(initReactI18next)
    .init({
        ...i18nConfig,
        resources,
        lng: getLocaleFromPathname(window.location.pathname),
    })
    .then(() => {
        startTransition(() => {
            hydrateRoot(
                document,
                <StrictMode>
                    <I18nextProvider i18n={i18next}>
                        <HydratedRouter />
                    </I18nextProvider>
                </StrictMode>,
            );
        });
    });
