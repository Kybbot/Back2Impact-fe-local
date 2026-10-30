/**
 * Drop-in replacements for React Router's `Link`, `NavLink`, `Navigate` and
 * `useNavigate` that keep the visitor inside their language.
 *
 * Every internal target in the app is written locale-free — `/jobs/all`, not
 * `/en/jobs/all` — and gets the prefix added here from the current URL. Import
 * these instead of the react-router originals anywhere a path is hardcoded;
 * without them a link on `/en/jobs/all` silently drops the reader back into
 * Ukrainian.
 *
 * The components live in their own module and the hooks in theirs: a file that
 * mixes the two breaks React Fast Refresh (`react-refresh/only-export-components`),
 * so this barrel is what puts them back under one import path.
 */

export { Link, NavLink, Navigate } from "./components";
export { useLocalizeTo } from "./use-localize-to";
export { useNavigate } from "./use-navigate";
export { redirect } from "./redirect";
