import type { Config } from "@react-router/dev/config";

import { NON_DEFAULT_LOCALES } from "./src/i18n/config";

export default {
    // keeps the existing src/ layout instead of the default app/
    appDirectory: "src",
    ssr: true,
    // the landing page is static, so it is generated at build time — once per
    // language, since `/` and `/en` are different documents
    prerender: ["/", ...NON_DEFAULT_LOCALES.map((locale) => `/${locale}`)],
} satisfies Config;
