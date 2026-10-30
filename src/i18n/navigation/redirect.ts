import { redirect as routerRedirect } from "react-router";

import { getLocaleFromPathname, localizePath } from "../locale";

/**
 * `redirect` for loaders and actions, which have a `Request` instead of a
 * router context. The locale is taken from the URL being handled, so a
 * redirect out of `/en/...` lands back in `/en/...`.
 */
export const redirect = (path: string, request: Request, init?: number | ResponseInit) =>
    routerRedirect(localizePath(path, getLocaleFromPathname(new URL(request.url).pathname)), init);
