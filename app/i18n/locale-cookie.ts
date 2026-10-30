/**
 * The language the visitor picked, remembered across visits.
 *
 * This does not make the cookie a second source of truth — the URL stays the
 * only thing that decides what a page renders in (see `locale.ts`). The cookie
 * only answers a different question: which URL a visitor who has chosen before
 * should land on when they enter the site through a bare, unprefixed path.
 *
 * A cookie rather than `localStorage` so the choice is also readable from a
 * request header, should the redirect ever move to the server or a proxy.
 */

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "./config";

export const LOCALE_COOKIE = "lng";

/** a year: the choice should outlive any plausible gap between visits */
const MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Remembers `locale` for the next entry into the site. Browser only — called
 * from the language switcher and from the effect that mirrors the signed-in
 * user's stored preference.
 */
export const rememberLocale = (locale: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${MAX_AGE}; samesite=lax`;
};

/**
 * Inlined into `<head>` by the root layout, above everything else that renders.
 *
 * It runs before hydration and before the first paint, so a visitor who chose
 * English never sees a frame of the Ukrainian document — the browser is already
 * on its way to the `/en` twin instead.
 *
 * Why a script and not a redirect in a loader: `/` and `/en` are prerendered
 * (see `react-router.config.ts`) and served straight off disk by
 * `react-router-serve`, so no loader of ours runs for the landing page — the
 * single most common way into the site. This covers every route, prerendered
 * or not, without making any document response depend on a request header,
 * which would mean `Vary: Cookie` on HTML that is currently cacheable for
 * everyone.
 *
 * The choice wins in both directions: a visitor who picked Ukrainian is moved
 * off `/en/jobs/all` to `/jobs/all` exactly as one who picked English is moved
 * onto the prefix. The consequence to know about is that someone's shared
 * `/en/...` link opens in the recipient's own language, not the sender's.
 *
 * The rest is deliberately narrow:
 *  - no cookie means no choice has been made, and the URL stands as written.
 *    Crawlers are in exactly that position, so both language trees keep being
 *    indexed as they are today;
 *  - a cookie holding anything but a supported locale is ignored rather than
 *    guessed at;
 *  - `location.replace`, so the page the visitor was bounced off does not end
 *    up in their history as a step to go Back to.
 */
export const LOCALE_BOOTSTRAP = `(function(){try{
var path=location.pathname,def=${JSON.stringify(DEFAULT_LOCALE)},all=${JSON.stringify(SUPPORTED_LOCALES)},cur=def,rest=path;
for(var i=0;i<all.length;i++){var p=all[i];if(p===def)continue;
if(path==="/"+p||path.indexOf("/"+p+"/")===0){cur=p;rest=path.slice(p.length+1)||"/";break;}}
var stored=(document.cookie.match(/(?:^|;\\s*)${LOCALE_COOKIE}=([^;]*)/)||[])[1];
if(!stored||all.indexOf(stored)<0||stored===cur)return;
var head=stored===def?"":"/"+stored;
location.replace((head+(rest==="/"?(head?"":"/"):rest))+location.search+location.hash);
}catch(e){}})();`;
