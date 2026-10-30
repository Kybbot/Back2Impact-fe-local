import VerifyEmailBlock from "../pages/VerifyEmail/verify-email-block";
import { localeFromLocation, metaT } from "../i18n/i18n.static";
import { SITE_NAME, NOINDEX } from "../utils/seo";
import type { Route } from "./+types/verify-email";

// signed-in / transactional page: nothing here belongs in an index,
// and robots.txt disallows the path as well
export const meta: Route.MetaFunction = ({ location }) => {
    const t = metaT(localeFromLocation(location), "seo");

    return [{ title: t("verifyEmail.title", { site: SITE_NAME }) }, NOINDEX];
};

// client-only route: a `clientLoader` with no server `loader` plus a
// `HydrateFallback` keeps this component out of the server render
export async function clientLoader() {
    return null;
}

export function HydrateFallback() {
    return null;
}

export default VerifyEmailBlock;
