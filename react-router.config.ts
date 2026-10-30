import type { Config } from "@react-router/dev/config";

import { NON_DEFAULT_LOCALES } from "./app/i18n/config";

export default {
    ssr: true,
    // the landing page is static, so it is generated at build time — once per
    // language, since `/` and `/en` are different documents
    prerender: ["/", ...NON_DEFAULT_LOCALES.map((locale) => `/${locale}`)],
} satisfies Config;
